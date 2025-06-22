import { ShortCodeService } from './short-code.service';

describe('ShortCodeService', () => {
  let service: ShortCodeService;

  beforeEach(() => {
    service = new ShortCodeService();
  });

  it('should generate unique codes', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      codes.add(service.generate());
    }
    expect(codes.size).toBe(1000);
  });

  it('should respect custom length', () => {
    const code = service.generate(8);
    expect(code).toHaveLength(8);
  });
});
