import * as React from "react"
import { DatePickerM3 } from "@/components/ui/date-picker-m3"

interface DateInputProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  id?: string
  className?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

/**
 * DateInput - Composant de saisie de date avec Material 3
 * 
 * Wrapper du DatePickerM3 qui accepte des dates au format ISO string
 * et maintient la compatibilité avec l'API existante
 */
export function DateInput({ 
  value, 
  onChange, 
  placeholder, 
  id, 
  className,
  disabled,
  minDate,
  maxDate 
}: DateInputProps) {
  const date = React.useMemo(
    () => value ? new Date(value) : undefined,
    [value]
  )

  const handleChange = React.useCallback(
    (selectedDate: Date | undefined) => {
      if (onChange) {
        if (selectedDate) {
          // Utiliser le fuseau horaire local au lieu d'UTC
          const year = selectedDate.getFullYear()
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
          const day = String(selectedDate.getDate()).padStart(2, '0')
          onChange(`${year}-${month}-${day}`)
        } else {
          onChange("")
        }
      }
    },
    [onChange]
  )

  return (
    <div id={id} className={className}>
      <DatePickerM3
        variant="popover"
        value={date}
        onChange={handleChange}
        placeholder={placeholder || "Sélectionner une date"}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  )
}
