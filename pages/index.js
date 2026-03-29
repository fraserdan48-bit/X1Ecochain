import React from 'react';

export default function Home({ html }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export async function getStaticProps() {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(process.cwd(), 'index.html');
  let html = '<h1>Index not found</h1>';
  try {
    html = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.warn('Could not read index.html:', e && e.message);
  }
  return { props: { html } };
}
