import { CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Palette, Sun, Moon, Laptop2, Sparkles, Lightbulb } from "lucide-react"
import { GlassPanel, ThemeCard, SectionHeader } from "@/app/dashboard/configuracion/components/SharedUI"

interface AppearanceConfigProps {
  theme: string | undefined
  setTheme: (theme: string) => void
}

export function AppearanceConfig({ theme, setTheme }: AppearanceConfigProps) {
  return (
    <GlassPanel>
      <CardContent className="p-6 space-y-6">
        <SectionHeader 
          icon={<Palette className="h-5 w-5" />}
          title="Apariencia"
          description="Control de modo visual y preferencias de interfaz"
        />

        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            Tema de la aplicación
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ThemeCard
              active={theme === "light"}
              icon={<Sun className="h-6 w-6" />}
              label="Modo Claro"
              description="Ideal para el día"
              onClick={() => setTheme("light")}
            />
            <ThemeCard
              active={theme === "dark"}
              icon={<Moon className="h-6 w-6" />}
              label="Modo Oscuro"
              description="Reduce fatiga visual"
              onClick={() => setTheme("dark")}
            />
            <ThemeCard
              active={theme === "system"}
              icon={<Laptop2 className="h-6 w-6" />}
              label="Automático"
              description="Según tu sistema"
              onClick={() => setTheme("system")}
            />
          </div>
        </div>

        <Alert className="border-primary/20 bg-primary/5">
          <Sparkles className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary font-medium">Próximamente</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Paletas de colores personalizadas, ajuste de densidad de interfaz y configuración de animaciones.
          </AlertDescription>
        </Alert>
      </CardContent>
    </GlassPanel>
  )
}
