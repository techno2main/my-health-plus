/**
 * Service d'accès à la base ANSM
 * IMPORTANT : L'API REST officielle n'est pas accessible via CORS
 * Solution : Recherche dans le catalogue Supabase (pré-importé depuis ANSM)
 */

import { supabase } from "@/integrations/supabase/client";

export interface ANSMMedication {
  codeCIS: string;
  denomination: string;
  formePharmaceutique: string;
  voiesAdministration: string[];
  statutAMM: string;
  commercialisation: string;
  titulaire?: string;
  substanceActive?: string;
  catalogId?: string; // ID dans medication_catalog si déjà existant
}

// Mapping substance active → pathologie
const SUBSTANCE_TO_PATHOLOGY_MAP: Record<string, string> = {
  'PARACÉTAMOL': 'Douleur/Fièvre',
  'IBUPROFÈNE': 'Douleur/Fièvre',
  'ASPIRINE': 'Prévention cardiovasculaire',
  'AMOXICILLINE': 'Infection bactérienne',
  'METFORMINE': 'Diabète Type 2',
  'ATORVASTATINE': 'Cholestérol',
  'SIMVASTATINE': 'Cholestérol',
  'OMÉPRAZOLE': 'Reflux gastro-œsophagien',
  'LÉVOTHYROXINE': 'Hypothyroïdie',
  'AMLODIPINE': 'Hypertension artérielle',
  'MÉTOPROLOL': 'Hypertension artérielle',
  'ATÉNOLOL': 'Hypertension artérielle',
  'NÉBIVOLOL': 'Hypertension artérielle',
  'HYDROCHLOROTHIAZIDE': 'Hypertension artérielle',
  'INDAPAMIDE': 'Hypertension artérielle',
  'RAMIPRIL': 'Hypertension artérielle',
  'PÉRINDOPRIL': 'Hypertension artérielle',
  'ÉNALAPRIL': 'Hypertension artérielle',
  'LOSARTAN': 'Hypertension artérielle',
  'VALSARTAN': 'Hypertension artérielle',
  'FUROSÉMIDE': 'Insuffisance cardiaque',
  'TRAMADOL': 'Douleur chronique',
  'CODÉINE': 'Douleur chronique',
  'MORPHINE': 'Douleur chronique',
  'ALPRAZOLAM': 'Anxiété',
  'LORAZÉPAM': 'Anxiété',
  'SERTRALINE': 'Dépression',
  'ESCITALOPRAM': 'Dépression',
  'VENLAFAXINE': 'Anxiété',
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

/**
 * Recherche dans la table ANSM officielle (15 823 médicaments)
 * Utilise PostgreSQL full-text search pour performance optimale
 * @param searchTerm - Terme de recherche (nom du médicament)
 * @returns Liste des médicaments trouvés
 */
export async function searchANSMApi(searchTerm: string): Promise<ANSMMedication[]> {
  if (!searchTerm || searchTerm.length < 3) {
    return [];
  }

  try {
    // Extraire nom commercial depuis denomination (avant le dosage)
    const extractCommercialName = (denom: string): string => {
      return denom.split(/\s+\d/)[0].trim().toUpperCase();
    };

    // Recherche dans nom commercial ET substance active
    const { data, error } = await supabase
      .from('ansm_medications')
      .select('code_cis, name, form, strength, substance_active, pathology_id, administration_route')
      .or(`name.ilike.${searchTerm}%,substance_active.ilike.%${searchTerm}%`) // Priorité: commence par
      .order('substance_active')
      .order('strength')
      .limit(50);

    if (error) {
      console.error('[ANSM Search] Erreur Supabase:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Nettoyer substance active (enlever sels chimiques)
    const cleanSubstance = (sub: string): string => {
      return sub
        .replace(/^(CHLORHYDRATE|SULFATE|CITRATE|SUCCINATE|PHOSPHATE|TARTRATE|FUMARATE|MALEATE|ACETATE|MALATE) (DE |D')/i, '')
        .trim();
    };

    // Filtrer résultats pertinents (nom commercial ou substance commence par terme)
    const relevantData = data.filter(med => {
      const commercialName = extractCommercialName(med.name);
      const cleanedSub = cleanSubstance(med.substance_active || '');
      const searchUpper = searchTerm.toUpperCase();
      
      return commercialName.startsWith(searchUpper) || 
             cleanedSub.toUpperCase().startsWith(searchUpper);
    }).slice(0, 20);

    // Vérifier catalog avec noms commerciaux ET substances
    const { data: catalogMeds } = await supabase
      .from('medication_catalog')
      .select('id, name, strength');

    // Créer Map avec ID pour matching flexible pour dosages combinés
    const catalogMap = new Map(
      (catalogMeds || []).map(c => {
        const normalizedStrength = (c.strength || '').replace(/\s/g, '').toUpperCase();
        return [`${c.name.toUpperCase()}|${normalizedStrength}`, c.id];
      })
    );

    const results: ANSMMedication[] = relevantData.map(med => {
      const cleanedSub = cleanSubstance(med.substance_active || '');
      const commercialName = extractCommercialName(med.name);
      const normalizedStrength = (med.strength || '').replace(/\s/g, '').toUpperCase();
      
      // Vérifier si dans catalog (matching flexible pour dosages combinés)
      let catalogId: string | undefined;
      
      // Essayer match exact
      const keyCommercial = `${commercialName}|${normalizedStrength}`;
      const keySubstance = `${cleanedSub.toUpperCase()}|${normalizedStrength}`;
      
      if (catalogMap.has(keyCommercial)) {
        catalogId = catalogMap.get(keyCommercial);
      } else if (catalogMap.has(keySubstance)) {
        catalogId = catalogMap.get(keySubstance);
      } else {
        // Match par préfixe (pour XIGDUO 5mg qui matche 5mg/1000mg)
        for (const [catalogKey, id] of catalogMap) {
          const [catalogName, catalogStrength] = catalogKey.split('|');
          
          // Si nom matche ET dosage catalog commence par dosage ANSM
          if ((catalogName === commercialName || catalogName === cleanedSub.toUpperCase()) &&
              catalogStrength.startsWith(normalizedStrength)) {
            catalogId = id;
            break;
          }
        }
      }
      
      return {
        codeCIS: med.code_cis,
        denomination: med.name,
        formePharmaceutique: med.form || '',
        voiesAdministration: med.administration_route ? [med.administration_route] : [],
        statutAMM: catalogId ? 'Déjà utilisé' : 'Validé ANSM',
        commercialisation: 'Commercialisé',
        titulaire: '',
        substanceActive: cleanedSub,
        catalogId, // AJOUT : ID du catalog si trouvé
      };
    });

    return results;
  } catch (error) {
    console.error('[ANSM Search] Erreur:', error);
    return [];
  }
}

/**
 * Trouve la pathologie associée à une substance active
 */
export function getPathologyFromSubstance(substanceActive: string | undefined): string | null {
  if (!substanceActive) return null;

  const normalized = substanceActive.toUpperCase().trim();

  for (const [substance, pathology] of Object.entries(SUBSTANCE_TO_PATHOLOGY_MAP)) {
    if (normalized.includes(substance)) {
      return pathology;
    }
  }

  return null;
}

/**
 * Convertit un médicament ANSM en format catalog
 */
export function convertANSMToCatalog(ansmMed: ANSMMedication) {
  return {
    name: cleanMedicationName(ansmMed.denomination),
    form: ansmMed.formePharmaceutique,
    strength: extractStrength(ansmMed.denomination),
    description: `Substance active : ${ansmMed.denomination}`,
    is_approved: true,
    pathology: null,
  };
}

function cleanMedicationName(denomination: string): string {
  return denomination
    .replace(/,?\s*\d+(?:[,\.]\d+)?\s*(?:mg|g|ml|µg|UI|%).*$/i, '')
    .replace(/,?\s*(comprimé|gélule|capsule|solution|sirop|poudre).*$/i, '')
    .trim();
}

function extractStrength(denomination: string): string | null {
  const strengthMatch = denomination.match(/(\d+(?:[,\.]\d+)?\s*(?:mg|g|ml|µg|UI|%)(?:\s*\/\s*\d+(?:[,\.]\d+)?\s*(?:mg|g|ml|µg|UI|%))*)/i);
  return strengthMatch ? strengthMatch[1].replace(',', '.') : null;
}
