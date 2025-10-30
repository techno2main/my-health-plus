import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExportData } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';

// Fonction pour encoder les caractères spéciaux pour jsPDF
const encodeText = (text: string): string => {
  // jsPDF supporte l'encodage UTF-8 en utilisant la police helvetica
  return text;
};

export const generatePDF = async (data: ExportData): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    floatPrecision: 16
  });
  
  // Utiliser une police qui supporte l'UTF-8
  doc.setFont('helvetica');
  
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(encodeText('MyHealth+ - Export Médical'), 105, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(encodeText(`Date d'export : ${format(new Date(data.exportDate), 'dd/MM/yyyy à HH:mm', { locale: fr })}`), 105, yPosition, { align: 'center' });
  yPosition += 5;

  if (data.period.startDate || data.period.endDate) {
    const periodText = `Période : ${data.period.startDate ? format(new Date(data.period.startDate), 'dd/MM/yyyy') : '...'} - ${data.period.endDate ? format(new Date(data.period.endDate), 'dd/MM/yyyy') : '...'}`;
    doc.text(encodeText(periodText), 105, yPosition, { align: 'center' });
  }
  yPosition += 15;

  // Profile
  if (data.profile) {
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(encodeText('Profil Patient'), 14, yPosition);
    yPosition += 8;

    const profileData = [
      ['Nom', `${data.profile.firstName} ${data.profile.lastName}`],
      ['Date de naissance', data.profile.dateOfBirth ? format(new Date(data.profile.dateOfBirth), 'dd/MM/yyyy') : '-'],
      ['Groupe sanguin', data.profile.bloodType || '-'],
      ['Taille', data.profile.height ? `${data.profile.height} cm` : '-'],
      ['Poids', data.profile.weight ? `${data.profile.weight} kg` : '-'],
      ['Téléphone', data.profile.phone || '-'],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: profileData,
      theme: 'plain',
      styles: { 
        fontSize: 10, 
        cellPadding: 3,
        font: 'helvetica'
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 130 }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Adherence
  if (data.adherence) {
    yPosition = checkPageBreak(doc, yPosition, 60);
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(encodeText('Statistiques d\'Observance'), 14, yPosition);
    yPosition += 8;

    const adherenceData = [
      ['Prises à l\'heure', data.adherence.takenOnTime.toString()],
      ['Prises en retard', data.adherence.lateIntakes.toString()],
      ['Prises manquées', data.adherence.skipped.toString()],
      ['Observance 7 jours', `${data.adherence.adherence7Days}% (${data.adherence.total7Days} prises)`],
      ['Observance 30 jours', `${data.adherence.adherence30Days}% (${data.adherence.total30Days} prises)`],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: adherenceData,
      theme: 'plain',
      styles: { 
        fontSize: 10, 
        cellPadding: 3,
        font: 'helvetica'
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 120 }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Treatments avec ordonnances et prises
  if (data.treatments && data.treatments.length > 0) {
    yPosition = checkPageBreak(doc, yPosition, 40);
    
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Traitements', 14, yPosition);
    yPosition += 10;

    data.treatments.forEach((treatment, index) => {
      yPosition = checkPageBreak(doc, yPosition, 80);
      
      // En-tête du traitement avec fond coloré
      doc.setFillColor(66, 139, 202);
      doc.roundedRect(14, yPosition, 182, 10, 2, 2, 'F');
      
      // Nom du traitement en blanc
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(treatment.name, 18, yPosition + 7);
      
      // Badge statut
      const statusText = treatment.isActive ? 'Actif' : 'Inactif';
      const statusColor = treatment.isActive ? [40, 167, 69] : [108, 117, 125];
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(168, yPosition + 1.5, 24, 7, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(statusText, 170, yPosition + 6);
      
      yPosition += 13;

      // Informations du traitement
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      
      // Pathologie
      doc.text('Pathologie:', 18, yPosition);
      doc.setTextColor(40, 40, 40);
      doc.text(treatment.pathology || '-', 50, yPosition);
      yPosition += 5;
      
      // Dates
      doc.setTextColor(80, 80, 80);
      doc.text('Debut:', 18, yPosition);
      doc.setTextColor(40, 40, 40);
      doc.text(format(new Date(treatment.startDate), 'dd/MM/yyyy'), 50, yPosition);
      doc.setTextColor(80, 80, 80);
      doc.text('Fin:', 100, yPosition);
      doc.setTextColor(40, 40, 40);
      doc.text(treatment.endDate ? format(new Date(treatment.endDate), 'dd/MM/yyyy') : 'En cours', 115, yPosition);
      yPosition += 5;

      // Ordonnance si présente
      if (treatment.prescriptionInfo) {
        doc.setTextColor(80, 80, 80);
        doc.text('Ordonnance:', 18, yPosition);
        doc.setTextColor(40, 40, 40);
        const ordoText = `${format(new Date(treatment.prescriptionInfo.prescriptionDate), 'dd/MM/yyyy')}${treatment.prescriptionInfo.doctorName ? ' - Dr ' + treatment.prescriptionInfo.doctorName : ''}`;
        doc.text(ordoText, 50, yPosition);
        yPosition += 5;
        
        if (treatment.prescriptionInfo.durationDays) {
          doc.setTextColor(80, 80, 80);
          doc.text('Duree:', 18, yPosition);
          doc.setTextColor(40, 40, 40);
          doc.text(`${treatment.prescriptionInfo.durationDays} jours`, 50, yPosition);
          yPosition += 5;
        }
      }

      if (treatment.description) {
        doc.setTextColor(80, 80, 80);
        doc.text('Note:', 18, yPosition);
        doc.setTextColor(40, 40, 40);
        const descLines = doc.splitTextToSize(treatment.description, 140);
        doc.text(descLines, 50, yPosition);
        yPosition += 5 * descLines.length;
      }

      yPosition += 2;

      // Médicaments prescrits
      if (treatment.medications.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text('Medicaments prescrits', 18, yPosition);
        yPosition += 6;

        treatment.medications.forEach((med) => {
          yPosition = checkPageBreak(doc, yPosition, 15);
          
          // Carte médicament avec fond gris clair
          doc.setFillColor(248, 249, 250);
          doc.roundedRect(18, yPosition - 3, 176, 11, 2, 2, 'F');
          
          // Nom du médicament
          doc.setFontSize(9);
          doc.setTextColor(40, 40, 40);
          doc.text(med.name, 22, yPosition + 2);
          
          // Stock badge si disponible
          if (med.currentStock !== undefined && med.minThreshold !== undefined) {
            const stockText = `${med.currentStock}/${med.minThreshold}`;
            const stockWidth = doc.getTextWidth(stockText) + 6;
            const stockColor = med.currentStock <= med.minThreshold * 0.25 ? [220, 53, 69] : 
                              med.currentStock <= med.minThreshold * 0.5 ? [255, 193, 7] : [40, 167, 69];
            doc.setFillColor(stockColor[0], stockColor[1], stockColor[2]);
            doc.roundedRect(188 - stockWidth, yPosition - 1, stockWidth, 6, 2, 2, 'F');
            doc.setFontSize(7);
            doc.setTextColor(255, 255, 255);
            doc.text(stockText, 191 - stockWidth, yPosition + 2.5);
          }
          
          yPosition += 5;
          
          // Dosage et horaires
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(med.dosage, 22, yPosition);
          
          if (med.times.length > 0) {
            doc.text(med.times.join(', '), 100, yPosition);
          }
          
          yPosition += 7;
        });
        
        yPosition += 2;
      }

      // Historique des prises pour ce traitement
      if (treatment.intakes && treatment.intakes.length > 0) {
        yPosition = checkPageBreak(doc, yPosition, 30);
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`Historique des prises (${treatment.intakes.length})`, 18, yPosition);
        yPosition += 6;

        // Afficher TOUTES les prises
        const intakesData = treatment.intakes.map(i => [
          i.date,
          i.medicationName,
          i.scheduledTime,
          i.takenAt || '-',
          getStatusLabel(i.status),
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Medicament', 'Prevu', 'Pris', 'Statut']],
          body: intakesData,
          theme: 'striped',
          styles: { 
            fontSize: 7, 
            cellPadding: 1.5,
            font: 'helvetica'
          },
          headStyles: { 
            fillColor: [108, 117, 125], 
            textColor: 255, 
            fontStyle: 'bold', 
            fontSize: 8 
          },
          margin: { left: 18, right: 18 },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 5;
      }

      yPosition += 8; // Espace entre les traitements
    });
  }

  // Stocks
  if (data.stocks && data.stocks.length > 0) {
    doc.addPage();
    yPosition = 20;
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(encodeText('État des Stocks'), 14, yPosition);
    yPosition += 8;

    const stocksData = data.stocks.map(s => [
      s.medicationName,
      s.treatmentName,
      s.currentStock.toString(),
      s.minThreshold.toString(),
      getStockStatusLabel(s.status),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Médicament', 'Traitement', 'Stock actuel', 'Seuil minimum', 'Statut']],
      body: stocksData,
      theme: 'grid',
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        font: 'helvetica'
      },
      headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    });
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`MyHealth+ - Page ${i}/${pageCount}`, 105, 290, { align: 'center' });
  }

  // Save - différent comportement selon la plateforme
  const fileName = `MyHealthPlus_Export_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
  
  if (Capacitor.isNativePlatform()) {
    // Sur Android/iOS : utiliser Capacitor Filesystem
    try {
      const pdfOutput = doc.output('dataurlstring');
      const base64Data = pdfOutput.split(',')[1];
      
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
      });
      
      console.log('PDF sauvegardé:', result.uri);
      
      // Ouvrir le fichier PDF avec l'application par défaut
      try {
        await FileOpener.open({
          filePath: result.uri,
          contentType: 'application/pdf',
          openWithDefault: true,
        });
        console.log('PDF ouvert avec succès');
      } catch (openError) {
        console.error('Erreur lors de l\'ouverture du PDF:', openError);
        // Le fichier est sauvegardé même si l'ouverture échoue
      }
      
    } catch (error) {
      console.error('Erreur sauvegarde PDF:', error);
      throw error;
    }
  } else {
    // Sur Web : téléchargement classique
    doc.save(fileName);
  }
};

const checkPageBreak = (doc: jsPDF, currentY: number, requiredSpace: number): number => {
  if (currentY + requiredSpace > 280) {
    doc.addPage();
    return 20;
  }
  return currentY;
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    taken: 'Prise',
    skipped: 'Manquée',
    pending: 'En attente',
  };
  return labels[status] || status;
};

const getStockStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    ok: 'OK',
    low: 'Faible',
    critical: 'Critique',
  };
  return labels[status] || status;
};
