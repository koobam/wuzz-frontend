import { BannersDataSchema } from '../banners.types';

jest.mock('@http/response', () => ({}), { virtual: true });

const banner = { id: 7, title: 'Promo', image_url: 'https://cdn.wuzz.care/b.jpg', target_type: 'service', target_value: '12', deeplink: 'wuzz://service/12' };

describe('BannersDataSchema', () => {
  it('reads a banner and turns a numeric id into text', () => {
    const { banners } = BannersDataSchema.parse({ banners: [banner] });
    expect(banners[0]).toMatchObject({ id: '7', target_type: 'service', deeplink: 'wuzz://service/12' });
  });

  it('defaults an absent target value and link to empty (a picture-only banner)', () => {
    const { banners } = BannersDataSchema.parse({ banners: [{ id: '1', title: 'x', image_url: 'https://a/b.jpg', target_type: 'none' }] });
    expect(banners[0]).toMatchObject({ target_value: '', deeplink: '' });
  });

  it.each([
    ['no image', { ...banner, image_url: '' }],
    ['unknown target type', { ...banner, target_type: 'product' }],
    ['no title', { ...banner, title: undefined }],
  ])('rejects a banner with %s', (_n, bad) => {
    expect(() => BannersDataSchema.parse({ banners: [bad] })).toThrow();
  });

  it('rejects a body that is not a banners object', () => {
    expect(() => BannersDataSchema.parse({ items: [] })).toThrow();
  });
});
