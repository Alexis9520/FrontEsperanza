"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, ArrowUpRight, Target, User, Lightbulb, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"

export default function DesarrolladoresPage() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      <Card className="border-border/60 bg-background/60">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 w-full">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-primary">
                <Building2 className="h-4 w-4" /> Quiénes Somos
              </div>
              <CardTitle className="text-2xl mt-2">Sobre Quantum Tech</CardTitle>
              <CardDescription className="mt-2 text-sm leading-relaxed">
                Somos una empresa de desarrollo de software especializada en crear soluciones tecnológicas a
                medida que impulsan la transformación digital. Con más de 5 años de experiencia, ayudamos a
                compañías de distintos sectores a optimizar procesos, mejorar su eficiencia y alcanzar sus
                objetivos. Unimos excelencia técnica y entendimiento de negocio para entregar resultados
                medibles.
              </CardDescription>
            </div>

            <div className="shrink-0">
              <Button asChild className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground">
                <a href="https://quantify.net.pe" target="_blank" rel="noopener noreferrer">
                  Conoce más <ArrowUpRight className="inline-block ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>

        
      </Card>

      {/* Cards section: moved outside the main Quiénes Somos card */}
      <div className="mt-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          >
          <AboutCard
            icon={<Target className="h-6 w-6 text-primary" />}
            title="Enfoque en Resultados"
            desc="Entregamos soluciones que generan valor real para tu negocio."
          />

          <AboutCard
            icon={<User className="h-6 w-6 text-primary" />}
            title="Equipo Experto"
            desc="Profesionales certificados con experiencia en tecnologías de vanguardia."
          />

          <AboutCard
            icon={<Lightbulb className="h-6 w-6 text-primary" />}
            title="Innovación Constante"
            desc="Adoptamos lo último para mantenerte a la vanguardia."
          />

          <AboutCard
            icon={<ShieldCheck className="h-6 w-6 text-primary" />}
            title="Calidad Garantizada"
            desc="Testing riguroso y QA para software de alta calidad."
          />
        </motion.div>
      </div>

    </div>
  )
}

function AboutCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 22, scale: 0.985 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 160, damping: 20 }
    }
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.035, y: -6 }}
      className="w-full h-64 md:h-72"
    >
      <div className="h-full rounded-lg p-1 bg-gradient-to-br from-white/3 via-primary/5 to-secondary/3">
        <div className="h-full rounded-md border border-white/6 bg-background/70 p-6 shadow-sm hover:shadow-2xl transition-all duration-300 flex">
          <div className="flex items-start gap-5 w-full">
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.08, rotate: 6 }}
              animate={{ scale: [1, 1.02, 1], rotate: [0, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
              className="flex items-center justify-center h-16 w-16 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 text-primary text-lg"
            >
              {icon}
            </motion.div>

            <div className="flex-1">
              <h4 className="text-lg font-semibold leading-snug">{title}</h4>
              <p className="text-sm text-muted-foreground mt-3">{desc}</p>

              {/* removed 'Más info' badge as requested */}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

