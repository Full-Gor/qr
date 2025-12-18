import { ContentType, ParsedData } from '../types';

export function parseQRContent(data: string): ParsedData {
  const trimmedData = data.trim();

  // URL detection
  if (/^https?:\/\//i.test(trimmedData)) {
    return {
      type: 'url',
      raw: data,
      url: trimmedData,
    };
  }

  // WiFi: WIFI:T:WPA;S:MyNetwork;P:MyPassword;;
  if (/^WIFI:/i.test(trimmedData)) {
    const ssidMatch = trimmedData.match(/S:([^;]*)/);
    const passwordMatch = trimmedData.match(/P:([^;]*)/);
    const encryptionMatch = trimmedData.match(/T:([^;]*)/);

    return {
      type: 'wifi',
      raw: data,
      ssid: ssidMatch?.[1] || '',
      password: passwordMatch?.[1] || '',
      encryption: encryptionMatch?.[1] || 'WPA',
    };
  }

  // vCard contact
  if (/^BEGIN:VCARD/i.test(trimmedData)) {
    const nameMatch = trimmedData.match(/FN:(.+)/i) || trimmedData.match(/N:([^;]+)/i);
    const phoneMatch = trimmedData.match(/TEL[^:]*:(.+)/i);
    const emailMatch = trimmedData.match(/EMAIL[^:]*:(.+)/i);
    const orgMatch = trimmedData.match(/ORG:(.+)/i);

    return {
      type: 'contact',
      raw: data,
      name: nameMatch?.[1]?.trim() || '',
      phone: phoneMatch?.[1]?.trim() || '',
      email: emailMatch?.[1]?.trim() || '',
      organization: orgMatch?.[1]?.trim() || '',
    };
  }

  // MECARD contact format
  if (/^MECARD:/i.test(trimmedData)) {
    const nameMatch = trimmedData.match(/N:([^;]+)/);
    const phoneMatch = trimmedData.match(/TEL:([^;]+)/);
    const emailMatch = trimmedData.match(/EMAIL:([^;]+)/);

    return {
      type: 'contact',
      raw: data,
      name: nameMatch?.[1]?.trim() || '',
      phone: phoneMatch?.[1]?.trim() || '',
      email: emailMatch?.[1]?.trim() || '',
    };
  }

  // Email: mailto:example@email.com
  if (/^mailto:/i.test(trimmedData)) {
    const emailParts = trimmedData.replace(/^mailto:/i, '').split('?');
    const emailTo = emailParts[0];
    const params = new URLSearchParams(emailParts[1] || '');

    return {
      type: 'email',
      raw: data,
      emailTo,
      subject: params.get('subject') || '',
      body: params.get('body') || '',
    };
  }

  // Phone: tel:+1234567890
  if (/^tel:/i.test(trimmedData)) {
    return {
      type: 'phone',
      raw: data,
      phoneNumber: trimmedData.replace(/^tel:/i, ''),
    };
  }

  // SMS: sms:+1234567890?body=Hello
  if (/^sms:/i.test(trimmedData) || /^smsto:/i.test(trimmedData)) {
    const smsParts = trimmedData.replace(/^sms(to)?:/i, '').split('?');
    const phoneNumber = smsParts[0];
    const params = new URLSearchParams(smsParts[1] || '');

    return {
      type: 'sms',
      raw: data,
      phoneNumber,
      message: params.get('body') || '',
    };
  }

  // Geo location: geo:latitude,longitude
  if (/^geo:/i.test(trimmedData)) {
    const coords = trimmedData.replace(/^geo:/i, '').split(',');

    return {
      type: 'geo',
      raw: data,
      latitude: parseFloat(coords[0]) || 0,
      longitude: parseFloat(coords[1]?.split('?')[0]) || 0,
    };
  }

  // Plain text (default)
  return {
    type: 'text',
    raw: data,
  };
}

export function getContentTypeLabel(type: ContentType): string {
  const labels: Record<ContentType, string> = {
    url: 'Lien URL',
    wifi: 'Wi-Fi',
    contact: 'Contact',
    email: 'Email',
    phone: 'Téléphone',
    sms: 'SMS',
    geo: 'Localisation',
    text: 'Texte',
  };
  return labels[type];
}

export function getContentTypeIcon(type: ContentType): string {
  const icons: Record<ContentType, string> = {
    url: '🔗',
    wifi: '📶',
    contact: '👤',
    email: '✉️',
    phone: '📞',
    sms: '💬',
    geo: '📍',
    text: '📝',
  };
  return icons[type];
}
