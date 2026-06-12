import '../../dist/feature-cards.js';

describe('feature-cards (browser)', () => {
  it('registers and renders a card in a real browser', async () => {
    const el = document.createElement('feature-cards');
    el.data = { cards: [{ id: 'browser', title: 'Real browser render' }] };
    document.body.append(el);
    await customElements.whenDefined('feature-cards');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const title = el.shadowRoot?.querySelector('.title');
    if (title?.textContent !== 'Real browser render') {
      throw new Error(`Expected title text, got ${title?.textContent ?? 'null'}`);
    }
    el.remove();
  });
});
