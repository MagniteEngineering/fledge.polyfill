describe('Initial test', () => {
    beforeAll(async () => {
      await page.goto('http://localhost:3000');
    });
  
    it('should be titled "foo"', async () => {
        expect(await page.title()).resolves.toMatch('foo');
    });
  });