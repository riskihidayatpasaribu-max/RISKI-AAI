import React from 'react';
import htm from 'htm';

/* html`<div className=${x}>...</div>` : JSX tanpa build step */
export const html = htm.bind(React.createElement);
