/**
 * Script d'import des médicaments depuis la base officielle ANSM
 * 
 * Source : Base de Données Publique des Médicaments
 * https://base-donnees-publique.medicaments.gouv.fr/
 * 
 * Fichiers requis dans /datas :
 * - CIS_bdpm_utf8.txt : Liste complète des médicaments
 * - CIS_COMPO_bdpm_utf8.txt : Composition (substances actives)
 * 
 * Usage : npx tsx scripts/import-medications.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes :');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaces
interface MedicationBDPM {
  cis: string;
  denomination: string;
  forme: string;
  voies_administration: string;
  statut_amm: string;
  commercialisation: string;
  titulaire?: string;
}

interface MedicationComposition {
  cis: string;
  code_substance: string;
  substance_active: string;
  dosage: string;
}

interface MedicationToImport {
  name: string;
  form: string | null;
  strength: string | null;
  pathology_id: string | null; // Lien vers la pathologie
  pathology: string | null; // Ancienne colonne (texte libre)
  description: string | null;
  is_approved: boolean;
  created_by: string | null;
}

/**
 * Normalise une chaîne pour la comparaison (retire les accents)
 * Permet de comparer PARACÉTAMOL avec PARACETAMOL
 */
function normalizeForComparison(str: string): string {
  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Retire les diacritiques
}

// Substances actives courantes (pour filtrage)
// Note : Orthographe française correcte avec accents
const COMMON_SUBSTANCES = [
  'PARACÉTAMOL',
  'IBUPROFÈNE',
  'ASPIRINE',
  'AMOXICILLINE',
  'METFORMINE',
  'ATORVASTATINE',
  'SIMVASTATINE',
  'OMÉPRAZOLE',
  'LÉVOTHYROXINE',
  'AMLODIPINE',
  'MÉTOPROLOL',
  'ATÉNOLOL',
  'FUROSÉMIDE',
  'TRAMADOL',
  'CODÉINE',
  'MORPHINE',
  'ALPRAZOLAM',
  'LORAZÉPAM',
  'SERTRALINE',
  'ESCITALOPRAM',
  'VENLAFAXINE',
  'INSULINE',
  'DAPAGLIFLOZINE',
  'EMPAGLIFLOZINE',
  'LIRAGLUTIDE',
  'WARFARINE',
  'RIVAROXABAN',
  'APIXABAN',
  'CLOPIDOGREL',
  'TICAGRÉLOR',
];

// Mapping substance active → pathologie (basique pour commencer)
// ⚠️ UTILISER LES NOMS EXACTS DES PATHOLOGIES DANS LA BASE
// Note : Orthographe française correcte avec accents
const SUBSTANCE_TO_PATHOLOGY_MAP: Record<string, string> = {
  'PARACÉTAMOL': 'Douleur/Fièvre', // ✅ Correspond à la pathologie existante
  'IBUPROFÈNE': 'Douleur/Fièvre',
  'ASPIRINE': 'Prévention cardiovasculaire',
  'AMOXICILLINE': 'Infection bactérienne',
  'METFORMINE': 'Diabète Type 2', // ✅ Correspond à la pathologie existante
  'ATORVASTATINE': 'Cholestérol', // ✅ Correspond à la pathologie existante
  'SIMVASTATINE': 'Cholestérol', // ✅ Correspond à la pathologie existante
  'OMÉPRAZOLE': 'Reflux gastro-œsophagien',
  'LÉVOTHYROXINE': 'Hypothyroïdie',
  'AMLODIPINE': 'Hypertension artérielle',
  'MÉTOPROLOL': 'Hypertension artérielle',
  'ATÉNOLOL': 'Hypertension artérielle',
  'FUROSÉMIDE': 'Insuffisance cardiaque',
  'TRAMADOL': 'Douleur chronique',
  'CODÉINE': 'Douleur chronique',
  'MORPHINE': 'Douleur chronique',
  'ALPRAZOLAM': 'Anxiété', // ✅ Correspond à la pathologie existante
  'LORAZÉPAM': 'Anxiété', // ✅ Correspond à la pathologie existante
  'SERTRALINE': 'Dépression',
  'ESCITALOPRAM': 'Dépression',
  'VENLAFAXINE': 'Anxiété', // ✅ Correspond à la pathologie existante
  'INSULINE': 'Diabète Type 2',
  'DAPAGLIFLOZINE': 'Diabète Type 2',
  'EMPAGLIFLOZINE': 'Diabète Type 2',
  'LIRAGLUTIDE': 'Diabète Type 2',
  'WARFARINE': 'Prévention cardiovasculaire',
  'RIVAROXABAN': 'Prévention cardiovasculaire',
  'APIXABAN': 'Prévention cardiovasculaire',
  'CLOPIDOGREL': 'Prévention cardiovasculaire',
  'TICAGRÉLOR': 'Prévention cardiovasculaire',
};

// Formes pharmaceutiques courantes
const COMMON_FORMS = [
  'comprimé',
  'gélule',
  'capsule',
  'solution buvable',
  'sirop',
  'poudre',
  'sachet',
];

/**
 * Parse le fichier CIS_bdpm_utf8.txt
 */
async function parseMedicationsBDPM(): Promise<Map<string, MedicationBDPM>> {
  console.log('📖 Lecture de CIS_bdpm_utf8.txt...');
  
  const medications = new Map<string, MedicationBDPM>();
  const fileStream = fs.createReadStream('datas/CIS_bdpm_utf8.txt', { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    const parts = line.split('\t');
    
    if (parts.length < 8) continue;

    const med: MedicationBDPM = {
      cis: parts[0].trim(),
      denomination: parts[1].trim(),
      forme: parts[2].trim(),
      voies_administration: parts[3].trim(),
      statut_amm: parts[4].trim(),
      commercialisation: parts[6].trim(),
      titulaire: parts[8]?.trim(),
    };

    medications.set(med.cis, med);
  }

  console.log(`✅ ${medications.size} médicaments chargés (${lineCount} lignes)`);
  return medications;
}

/**
 * Parse le fichier CIS_COMPO_bdpm_utf8.txt
 */
async function parseCompositions(): Promise<Map<string, MedicationComposition[]>> {
  console.log('📖 Lecture de CIS_COMPO_bdpm_utf8.txt...');
  
  const compositions = new Map<string, MedicationComposition[]>();
  const fileStream = fs.createReadStream('datas/CIS_COMPO_bdpm_utf8.txt', { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    const parts = line.split('\t');
    
    if (parts.length < 5) continue;

    const comp: MedicationComposition = {
      cis: parts[0].trim(),
      code_substance: parts[2].trim(),
      substance_active: parts[3].trim(),
      dosage: parts[4].trim(),
    };

    if (!compositions.has(comp.cis)) {
      compositions.set(comp.cis, []);
    }
    compositions.get(comp.cis)!.push(comp);
  }

  console.log(`✅ ${compositions.size} médicaments avec composition (${lineCount} lignes)`);
  return compositions;
}

/**
 * Extrait le dosage du nom de médicament
 */
function extractStrength(denomination: string): string | null {
  // Patterns courants : "500 mg", "1000 mg", "5 mg/1000 mg", "1 g"
  const strengthMatch = denomination.match(/(\d+(?:[,\.]\d+)?\s*(?:mg|g|ml|µg|UI|%)(?:\s*\/\s*\d+(?:[,\.]\d+)?\s*(?:mg|g|ml|µg|UI|%))*)/i);
  return strengthMatch ? strengthMatch[1].replace(',', '.') : null;
}

/**
 * Nettoie le nom du médicament (retire le dosage et la forme)
 */
function cleanMedicationName(denomination: string): string {
  return denomination
    .replace(/,?\s*\d+(?:[,\.]\d+)?\s*(?:mg|g|ml|µg|UI|%).*$/i, '') // Retire dosage et suite
    .replace(/,?\s*(comprimé|gélule|capsule|solution|sirop|poudre).*$/i, '') // Retire forme
    .trim();
}

/**
 * Récupère les pathologies depuis la base de données
 */
async function getPathologies(): Promise<Map<string, string>> {
  console.log('\n🏥 Chargement des pathologies...');
  
  const { data, error } = await supabase
    .from('pathologies')
    .select('id, name');

  if (error) {
    console.error('❌ Erreur lors de la récupération des pathologies :', error);
    return new Map();
  }

  const pathologyMap = new Map<string, string>();
  data?.forEach(pathology => {
    pathologyMap.set(pathology.name.toLowerCase(), pathology.id);
  });

  console.log(`✅ ${pathologyMap.size} pathologies chargées`);
  return pathologyMap;
}

/**
 * Trouve la pathologie associée à une substance active
 */
function findPathologyId(substance: string | null, pathologies: Map<string, string>): string | null {
  if (!substance) return null;

  const substanceNormalized = normalizeForComparison(substance);
  
  // Chercher un mapping direct (comparaison sans accents)
  for (const [key, pathologyName] of Object.entries(SUBSTANCE_TO_PATHOLOGY_MAP)) {
    const keyNormalized = normalizeForComparison(key);
    if (substanceNormalized.includes(keyNormalized)) {
      const pathologyId = pathologies.get(pathologyName.toLowerCase());
      if (pathologyId) return pathologyId;
    }
  }

  return null;
}

/**
 * Filtre les médicaments selon les critères
 */
function filterMedications(
  medications: Map<string, MedicationBDPM>,
  compositions: Map<string, MedicationComposition[]>,
  pathologies: Map<string, string>
): MedicationToImport[] {
  console.log('\n🔍 Application des filtres...');
  
  const filtered: MedicationToImport[] = [];
  let countCommercialise = 0;
  let countCommonForm = 0;
  let countCommonSubstance = 0;

  for (const [cis, med] of medications) {
    // Filtre 1 : Commercialisé uniquement
    if (med.commercialisation !== 'Commercialisée') continue;
    countCommercialise++;

    // Filtre 2 : Formes courantes
    const hasCommonForm = COMMON_FORMS.some(form => 
      med.forme.toLowerCase().includes(form)
    );
    if (!hasCommonForm) continue;
    countCommonForm++;

    // Filtre 3 : Substance active courante (comparaison sans accents)
    const comps = compositions.get(cis) || [];
    const hasCommonSubstance = comps.some(comp => {
      const compNormalized = normalizeForComparison(comp.substance_active);
      return COMMON_SUBSTANCES.some(substance => {
        const substanceNormalized = normalizeForComparison(substance);
        return compNormalized.includes(substanceNormalized);
      });
    });
    if (!hasCommonSubstance) continue;
    countCommonSubstance++;

    // Filtre 4 : Exclure usage hospitalier
    if (med.denomination.toLowerCase().includes('usage hospitalier')) continue;

    // Construire l'objet à importer
    const firstSubstance = comps.length > 0 ? comps[0].substance_active : null;
    const pathologyId = findPathologyId(firstSubstance, pathologies);
    const pathologyName = firstSubstance ? SUBSTANCE_TO_PATHOLOGY_MAP[Object.keys(SUBSTANCE_TO_PATHOLOGY_MAP).find(key => normalizeForComparison(firstSubstance).includes(normalizeForComparison(key))) || ''] : null;
    
    filtered.push({
      name: cleanMedicationName(med.denomination),
      form: med.forme || null,
      strength: extractStrength(med.denomination),
      pathology_id: pathologyId,
      pathology: pathologyName || null, // Ancienne colonne texte
      description: firstSubstance ? `Substance active : ${firstSubstance}` : null,
      is_approved: true,
      created_by: null, // Médicaments officiels sans créateur
    });
  }

  console.log(`   → Commercialisés : ${countCommercialise}`);
  console.log(`   → Formes courantes : ${countCommonForm}`);
  console.log(`   → Substances courantes : ${countCommonSubstance}`);
  console.log(`   → ✅ Retenus après filtres : ${filtered.length}`);

  return filtered;
}

/**
 * Récupère les médicaments existants dans la base
 */
async function getExistingMedications(): Promise<Set<string>> {
  console.log('\n🔍 Vérification des médicaments existants...');
  
  const { data, error } = await supabase
    .from('medication_catalog')
    .select('name');

  if (error) {
    console.error('❌ Erreur lors de la récupération :', error);
    return new Set();
  }

  const existingNames = new Set<string>();

  data?.forEach(med => {
    if (med.name) existingNames.add(med.name.toLowerCase());
  });

  console.log(`   → ${existingNames.size} médicaments existants`);

  return existingNames;
}

/**
 * Importe les médicaments en base de données
 */
async function importMedications(medications: MedicationToImport[], existing: Set<string>) {
  console.log('\n📤 Préparation de l\'import...');

  // Filtrer les doublons (uniquement par nom)
  const toImport = medications.filter(med => 
    !existing.has(med.name.toLowerCase())
  );

  console.log(`   → ${toImport.length} nouveaux médicaments à importer`);
  console.log(`   → ${medications.length - toImport.length} doublons ignorés`);

  if (toImport.length === 0) {
    console.log('\n✅ Aucun médicament à importer');
    return;
  }

  // Import par batch de 100
  const batchSize = 100;
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < toImport.length; i += batchSize) {
    const batch = toImport.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('medication_catalog')
      .insert(batch);

    if (error) {
      console.error(`❌ Erreur batch ${Math.floor(i / batchSize) + 1} :`, error.message);
      errors += batch.length;
    } else {
      imported += batch.length;
      console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(toImport.length / batchSize)} : ${batch.length} médicaments`);
    }
  }

  console.log(`\n✅ Import terminé : ${imported} médicaments importés, ${errors} erreurs`);
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Démarrage de l\'import des médicaments\n');
  console.log('═'.repeat(60));

  try {
    // 1. Parser les fichiers
    const medications = await parseMedicationsBDPM();
    const compositions = await parseCompositions();

    // 2. Charger les pathologies
    const pathologies = await getPathologies();

    // 3. Filtrer
    const filtered = filterMedications(medications, compositions, pathologies);

    // 4. Vérifier les existants
    const existing = await getExistingMedications();

    // 5. Importer
    await importMedications(filtered, existing);

    console.log('\n' + '═'.repeat(60));
    console.log('✅ Import terminé avec succès !');
    
    // 6. Statistiques finales
    const { count, error } = await supabase
      .from('medication_catalog')
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`📊 Total médicaments dans le catalog : ${count}`);
    }

  } catch (error) {
    console.error('❌ Erreur fatale :', error);
    process.exit(1);
  }
}

main();
