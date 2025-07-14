import { FieldState, FormField, FormState } from '#/types/form';
import { formatValue } from '#/utils/formatters';
import { useEffect, useState } from 'react';

export function useFormState<T>(
  fields: FormField<T>[],
  initialValues?: Partial<T>,
  visible?: boolean
) {
  const [state, setState] = useState<FormState<T>>({} as FormState<T>);

  useEffect(() => {
    const initialState = fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: {
        value: initialValues ? formatValue(initialValues[field.name], field.type) : '',
        error: undefined
      }
    }), {} as FormState<T>);
    
    setState(initialState);
  }, [fields, initialValues, visible]);

  const validate = (field: FormField<T>, value: string): string | undefined => {
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }
    
    return field.validation?.(value);
  };

  const handleChange = (field: FormField<T>, value: string) => {
    setState(prev => ({
      ...prev,
      [field.name]: {
        value,
        error: validate(field, value)
      }
    }));
  };

  const validateAll = (): boolean => {
    const newState = { ...state };
    let isValid = true;

    fields.forEach(field => {
      const error = validate(field, state[field.name]?.value || '');
      newState[field.name] = {
        ...state[field.name],
        error
      };
      if (error) isValid = false;
    });

    setState(newState);
    return isValid;
  };

  const hasErrors = (): boolean => {
    const values = Object.values(state) as FieldState[];
    return values.some(field => field.error !== undefined);
  };

  return {
    state,
    handleChange,
    validateAll,
    hasErrors
  };
}