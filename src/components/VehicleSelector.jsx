import { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
// Importing icons (simple placeholders for now, can be replaced with actual SVG icons or a library)
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>;
const ChevronUpDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.24a.75.75 0 011.06-.04l2.7 2.478 2.7-2.478a.75.75 0 111.06 1.06l-3.25 3a.75.75 0 01-1.06 0l-3.25-3a.75.75 0 01.04-1.06z" clipRule="evenodd" /></svg>;


const VehicleSelector = ({ id, label, icon, selectedValue, onChange, options, isLoading, placeholder, disabled }) => {
  const [query, setQuery] = useState('');

  const filteredOptions =
    query === ''
      ? (options || [])
      : (options || []).filter((option) =>
          String(option) // Ensure option is a string for .toLowerCase()
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );

  const displayValue = (value) => {
    // For Combobox, options might be objects later. For now, they are strings.
    return value || '';
  };
  
  return (
    <div className="mb-4">
      <Combobox value={selectedValue} onChange={onChange} disabled={disabled || isLoading}>
        <Combobox.Label className="block text-sm font-medium text-dga-gris-neutro mb-1">
          <span role="img" aria-label={`${label} icon`} className="mr-2">{icon}</span>{label}
        </Combobox.Label>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-sm border border-dga-verde-menta focus-within:ring-2 focus-within:ring-dga-verde-oscuro focus-within:border-dga-verde-oscuro">
            <Combobox.Input
              className="w-full border-none py-3 pl-3 pr-10 text-sm leading-5 text-dga-gris-oscuro focus:ring-0 disabled:bg-gray-100 disabled:cursor-not-allowed"
              displayValue={displayValue}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isLoading ? 'Cargando...' : (placeholder || `Buscar ${label.toLowerCase()}...`)}
              id={id}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {isLoading && !filteredOptions.length && query === '' && (
                 <div className="relative cursor-default select-none py-2 px-4 text-gray-700">Cargando opciones...</div>
              )}
              {!isLoading && filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  No se encontró nada.
                </div>
              ) : !isLoading && !options && (
                 <div className="relative cursor-default select-none py-2 px-4 text-gray-700">No hay opciones disponibles.</div>
              )}
              {filteredOptions.map((option) => (
                <Combobox.Option
                  key={String(option)} // Ensure key is a string
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-dga-verde-menta text-dga-verde-profundo' : 'text-dga-gris-oscuro'
                    }`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block ${selected ? 'font-medium text-dga-verde-profundo' : 'font-normal'} whitespace-normal break-words`} // Removed 'truncate', added 'whitespace-normal break-words'
                      >
                        {String(option)}
                      </span>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-dga-verde-profundo' : 'text-dga-verde'
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};

export default VehicleSelector;
