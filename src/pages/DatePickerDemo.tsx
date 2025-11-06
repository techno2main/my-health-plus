import { useState } from "react"
import { DatePickerM3 } from "@/components/ui/date-picker-m3"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

/**
 * Page de démonstration du DatePickerM3
 * Montre toutes les variantes et fonctionnalités du composant
 */
export default function DatePickerDemo() {
  const [date1, setDate1] = useState<Date>()
  const [date2, setDate2] = useState<Date>()
  const [date3, setDate3] = useState<Date>()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">DatePicker Material 3</h1>
          <p className="text-muted-foreground text-lg">
            Démonstration du composant de sélection de date Material Design 3
          </p>
        </div>

        {/* Fonctionnalités */}
        <Card>
          <CardHeader>
            <CardTitle>✨ Fonctionnalités</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium">Sélection rapide mois/année</h4>
                  <p className="text-sm text-muted-foreground">
                    Cliquez sur le mois pour choisir rapidement
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium">Swipe/Slide</h4>
                  <p className="text-sm text-muted-foreground">
                    Glissez pour naviguer entre les mois
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium">Saisie clavier</h4>
                  <p className="text-sm text-muted-foreground">
                    Cliquez sur l'icône crayon pour saisir directement
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-medium">Design Material 3</h4>
                  <p className="text-sm text-muted-foreground">
                    Respecte les guidelines Material Design 3
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Variant Modal */}
        <Card>
          <CardHeader>
            <CardTitle>Variant Modal (par défaut)</CardTitle>
            <CardDescription>
              Affiche le calendrier dans une boîte de dialogue modale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DatePickerM3
              value={date1}
              onChange={setDate1}
            />
            {date1 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Date sélectionnée :</p>
                <p className="text-lg">{date1.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variant Popover */}
        <Card>
          <CardHeader>
            <CardTitle>Variant Popover</CardTitle>
            <CardDescription>
              Affiche le calendrier dans un popover attaché au trigger
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DatePickerM3
              variant="popover"
              value={date2}
              onChange={setDate2}
              placeholder="Choisissez une date..."
            />
            {date2 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Date sélectionnée :</p>
                <p className="text-lg">{date2.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variant Inline */}
        <Card>
          <CardHeader>
            <CardTitle>Variant Inline</CardTitle>
            <CardDescription>
              Affiche le calendrier directement dans le contenu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DatePickerM3
              variant="inline"
              value={date3}
              onChange={setDate3}
            />
            {date3 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Date sélectionnée :</p>
                <p className="text-lg">{date3.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trigger personnalisé */}
        <Card>
          <CardHeader>
            <CardTitle>Avec trigger personnalisé</CardTitle>
            <CardDescription>
              Vous pouvez utiliser n'importe quel élément comme déclencheur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DatePickerM3
              value={date1}
              onChange={setDate1}
              trigger={
                <Button variant="default" className="rounded-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Ouvrir le calendrier
                </Button>
              }
            />
          </CardContent>
        </Card>

        {/* Instructions d'utilisation */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>💡 Instructions d'utilisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium">Pour sélectionner une date :</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Cliquez sur le bouton pour ouvrir le calendrier</li>
                <li>Cliquez sur le nom du mois pour accéder au sélecteur rapide</li>
                <li>Glissez horizontalement pour changer de mois</li>
                <li>Cliquez sur l'icône crayon pour saisir directement la date</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Saisie clavier :</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Format : JJ/MM/AAAA</li>
                <li>Passez automatiquement au champ suivant après 2 chiffres</li>
                <li>Validation en temps réel de la date</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Code exemple */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Exemple de code</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`import { DatePickerM3 } from "@/components/ui/date-picker-m3"

function MyComponent() {
  const [date, setDate] = useState<Date>()

  return (
    <DatePickerM3
      variant="popover"
      value={date}
      onChange={setDate}
      placeholder="Sélectionner une date"
      minDate={new Date(2020, 0, 1)}
      maxDate={new Date(2030, 11, 31)}
    />
  )
}`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
