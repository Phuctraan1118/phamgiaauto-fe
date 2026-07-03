import { useEffect } from 'react';

type SeoInput = {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  robots?: string;
};

function upsertMeta(selector: string, create: () => HTMLMetaElement, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setMetaName(name: string, content: string) {
  upsertMeta(
    `meta[name="${name}"]`,
    () => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', name);
      return meta;
    },
    content,
  );
}

function setMetaProperty(property: string, content: string) {
  upsertMeta(
    `meta[property="${property}"]`,
    () => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', property);
      return meta;
    },
    content,
  );
}

function setCanonical(url: string) {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
}

export function usePageSeo({ title, description, canonical, image, robots = 'index, follow' }: SeoInput) {
  useEffect(() => {
    const absoluteImage = image || 'https://phamgiaautomotive.vn/og-image.png';
    document.title = title;
    setCanonical(canonical);
    setMetaName('description', description);
    setMetaName('robots', robots);
    setMetaProperty('og:title', title);
    setMetaProperty('og:description', description);
    setMetaProperty('og:url', canonical);
    setMetaProperty('og:image', absoluteImage);
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', absoluteImage);
  }, [canonical, description, image, robots, title]);
}
