import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Mail, Globe } from "lucide-react";

export function AboutContent() {
  return (
    <div className="space-y-6">
      {/* Logo et version */}
      <Card className="p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-6 rounded-full bg-primary/10">
            <Heart className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">MyHealth+</h2>
        <p className="text-muted-foreground mb-1">Votre assistant santé personnel</p>
        <p className="text-sm text-muted-foreground">Version 1.1.0</p>
      </Card>

      {/* Contact */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Contact</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="mailto:support@techno2main.fr?bcc=techno2main@gmail.com&subject=Contact%20from%20MyHealth%2B%20App">
              <Mail className="mr-2 h-4 w-4" />
              E-mail
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="https://myhealthplus.web-tad.app" target="_blank" rel="noopener noreferrer">
              <Globe className="mr-2 h-4 w-4" />
              Application MyHealth+ 
            </a>
          </Button>
        </div>
      </Card>

      {/* Crédits */}
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          MyHealth+
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          © 2025 • TAD • Tous droits réservés.
        </p>
      </Card>
    </div>
  );
}
