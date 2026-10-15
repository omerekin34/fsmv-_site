import { useState } from 'react'

export function useFormState(initial) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const onChange = e => {
    const { name, value, type, checked } = e.target
    setValues(v => ({ ...v, [name]: type === 'checkbox' ? checked : value }))
    setErrors(er => ({ ...er, [name]: undefined }))
  }
  return { values, setValues, errors, setErrors, onChange }
}

export function validate(values, rules) {
  const errs = {}
  for (const [k, rule] of Object.entries(rules)) {
    const v = values[k]
    if (rule.required && (v === undefined || v === '' || v === false)) errs[k] = 'Bu alan zorunludur.'
    else if (rule.email && v && !/^\S+@\S+\.\S+$/.test(v)) errs[k] = 'Geçerli bir e-posta giriniz.'
    else if (rule.phone && v && !/^[\d\s()+/-]{10,}$/.test(v)) errs[k] = 'Geçerli bir telefon giriniz.'
  }
  return errs
}
