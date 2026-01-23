import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import useEmblaCarousel from 'embla-carousel-react';

export function PresentationContent() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const slides = [
    {
      title: "Notre mission",
      content: "MyHealth+ est une application conçue pour vous aider à gérer vos traitements médicaux en toute simplicité. Suivez vos prises, gérez vos stocks et consultez vos ordonnances en un seul endroit."
    },
    {
      title: "Suivi des traitements",
      icon: Star,
      content: "Rappels personnalisés pour ne jamais oublier vos médicaments"
    },
    {
      title: "Gestion des stocks",
      icon: Star,
      content: "Alertes de réapprovisionnement automatiques"
    },
    {
      title: "Ordonnances numériques",
      icon: Star,
      content: "Stockage sécurisé de vos prescriptions"
    },
    {
      title: "Historique détaillé",
      icon: Star,
      content: "Suivi complet de votre observance thérapeutique"
    }
  ];

  return (
    <Card className="p-6">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 px-2">
              <div className="text-center space-y-4">
                {slide.icon && (
                  <div className="flex justify-center">
                    <div className="p-3 rounded-full bg-primary/10">
                      <slide.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                )}
                <h3 className="font-semibold text-lg">{slide.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{slide.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dots indicateurs */}
      <div className="flex justify-center gap-2 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === selectedIndex ? 'w-8 bg-primary' : 'w-2 bg-muted'
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Aller à la slide ${index + 1}`}
          />
        ))}
      </div>
    </Card>
  );
}
