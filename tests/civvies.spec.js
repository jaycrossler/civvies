describe("Civvies", function () {
    it("is ready in grunt and Jasmine", function () {
        expect("Test").toContain("Test");
    });

    it("is being tested in a Jasmine SpecRunner", function () {
        var isInJasmine = document.location.pathname.indexOf('_SpecRunner.html');
        var isPhantom = window.navigator.userAgent.indexOf('PhantomJS');
        //console.log(window.navigator.userAgent);

        expect(isInJasmine).toBeGreaterThan(-1);
        expect(isPhantom).toBeTruthy();
    });

    it("loads with dependencies", function () {
        var game = new Civvies();
        var ver = game.version;

        expect(ver).toContain("civvies.js (version ");
    });
    it("has a version and summary", function () {
        var game = new Civvies();
        var ver = game.version;

        expect(ver).toContain("civvies.js (version ");
        expect(ver).toContain("civilization");
    });
    it("returns a seed as valid JSON", function () {
        var game = new Civvies();
        var seed = game.getSeed();

        expect(JSON.stringify(seed)).toContain('{"rand_seed":');
    });
    it("returns a seed that is a valid number", function () {
        var game = new Civvies();
        var seed = game.getSeed();
        var rand_seed = seed.rand_seed;

        expect(rand_seed).toEqual(jasmine.any(Number));
    });
});