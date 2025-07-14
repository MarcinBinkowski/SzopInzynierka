import { FieldType } from '#/types/form';
import { formatDateForDisplay, formatDateTimeForDisplay } from './dateFormatters';

export function formatValue(value: any, type: FieldType): string {
  if (!value) return '';
  
  switch (type) {
    case 'number':
      return value.toString();
    case 'date':
      return formatDateForDisplay(value);
    case 'datetime':
      return formatDateTimeForDisplay(value);
    default:
      return value;
  }
}