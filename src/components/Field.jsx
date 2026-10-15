import Select from './Select.jsx'

export default function Field({ label, name, type = 'text', value, onChange, error, as = 'input', options, required, placeholder }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}{required && ' *'}</label>
      {as === 'select' ? (
        <Select id={name} name={name} value={value} onChange={onChange} options={options} placeholder="Seçiniz..." />
      ) : as === 'textarea' ? (
        <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} />
      ) : (
        <input className="input" id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} />
      )}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
