import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WizardProgress } from "./WizardProgress";
import { Step1Info } from "./Step1Info";
import { Step2Medications } from "./Step2Medications";
import { Step3Stocks } from "./Step3Stocks";
import { Step4Summary } from "./Step4Summary";
import { TreatmentFormData } from "./types";
import { useTreatmentSubmit } from "./hooks/useTreatmentSubmit";

const TOTAL_STEPS = 4;

export function TreatmentWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<TreatmentFormData>({
    name: "",
    description: "",
    prescribingDoctorId: undefined as any,
    prescriptionId: undefined as any,
    prescriptionDate: "",
    startDate: "",
    durationDays: "90",
    qsp: "30",
    prescriptionFile: null,
    prescriptionFileName: "",
    pharmacyId: undefined as any,
    firstPharmacyVisit: "",
    medications: [],
    stocks: {},
  });

  // Fonction de validation (doit être définie avant le hook)
  const canSubmit = () => {
    return (
      formData.name.trim() !== "" &&
      formData.medications.length > 0 &&
      formData.medications.every((_, index) => 
        formData.stocks[index] && formData.stocks[index] > 0
      )
    );
  };

  // Hook de soumission
  const { loading, handleSubmit } = useTreatmentSubmit(formData, canSubmit);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prescData, doctorData, pharmacyData] = await Promise.all([
        supabase
          .from("prescriptions")
          .select("*, health_professionals(name)")
          .order("created_at", { ascending: false }),
        supabase
          .from("health_professionals")
          .select("*")
          .eq("type", "doctor")
          .order("name"),
        supabase
          .from("health_professionals")
          .select("*")
          .eq("type", "pharmacy")
          .order("name"),
      ]);

      if (prescData.error) throw prescData.error;
      if (doctorData.error) throw doctorData.error;
      if (pharmacyData.error) throw pharmacyData.error;

      setPrescriptions(prescData.data || []);
      setDoctors(doctorData.data || []);
      setPharmacies(pharmacyData.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Info
            formData={formData}
            setFormData={setFormData}
            prescriptions={prescriptions}
            doctors={doctors}
            pharmacies={pharmacies}
          />
        );
      case 2:
        return (
          <Step2Medications
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 3:
        return (
          <Step3Stocks
            formData={formData}
            setFormData={setFormData}
          />
        );
      case 4:
        return (
          <Step4Summary
            formData={formData}
            prescriptions={prescriptions}
            pharmacies={pharmacies}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <WizardProgress 
        currentStep={currentStep} 
        totalSteps={TOTAL_STEPS}
        onStepClick={setCurrentStep}
      />

      <div className="min-h-[400px]">
        {renderStep()}
      </div>

      <div className="flex gap-3 sticky bottom-0 bg-background pt-4 pb-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1 || loading}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>
        
        {currentStep < TOTAL_STEPS ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="flex-1 gradient-primary"
          >
            Suivant
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 gradient-primary"
          >
            {loading ? "Enregistrement..." : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Créer le traitement
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
