export function formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
  
  export function formatDateForApi(dateString: string): string {
    if (!dateString) return '';
    const [day, month , year] = dateString.split('.');
    return `${year}-${month}-${day}`;
  }
  
  export function isValidDate(dateString: string): boolean {
    const regex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!regex.test(dateString)) return false;
    
    const [day, month , year] = dateString.split('.').map(Number);
    const date = new Date(year, month - 1, day);
    return (
        date.getDate() === day && 
        date.getMonth() === month -1 && 
        date.getFullYear() === year &&
        month >= 1 && month <= 12 &&
        day >= 1 && day <= 31
    );
  }

  export function formatDateTimeForDisplay(dateTimeString: string): string {
    if (!dateTimeString) return '';
    
    const date = new Date(dateTimeString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }
  
  export function formatDateTimeForApi(dateTimeString: string): string | null {
    if (!dateTimeString) return null;
  
    const [datePart, timePart] = dateTimeString.split(' ');
    const [day, month, year] = datePart.split('.').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
  
    const date = new Date(year, month - 1, day, hours, minutes);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date time format. Expected DD.MM.YYYY HH:mm');
    }
  
    return date.toISOString();
  }
  
  export function isValidDateTime(dateTimeString: string): boolean {
    if (!dateTimeString) return false;
    
    const regex = /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/;
    if (!regex.test(dateTimeString)) return false;
  
    try {
      const [datePart, timePart] = dateTimeString.split(' ');
      const [day, month, year] = datePart.split('.').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
  
      if (month < 1 || month > 12) return false;
      if (day < 1 || day > 31) return false;
      if (hours < 0 || hours > 23) return false;
      if (minutes < 0 || minutes > 59) return false;
  
      const date = new Date(year, month - 1, day, hours, minutes);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }