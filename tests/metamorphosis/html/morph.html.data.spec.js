describe("Metamorphosis (to html preprocessor)", function() {

	var api = require('../../../index.js')();

	xit("should compile html with data", function(done) {
		api.morph("html").add({
			body: {
				h1: "<% this.name %> <small>(<% this.profile.job %>)</small>"
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<body><h1>John <small>(Developer)</small></h1></body>');
			done();
		}, {
			minify: true,
			name: "John", profile: { job: "Developer" }
		})
	});

	xit("should use 'if' statement", function(done) {
		api.morph("html").add({
			body: {
				h1: [
					"<% if(this.developer) { %>",
					{ p: "I'm a developer" },
					"<% } %>"
				]
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<body><h1><p>I\'m a developer</p></h1></body>');
			done();
		}, {
			minify: true,
			developer: true
		})
	});

	xit("should use 'if' statement (false)", function(done) {
		api.morph("html").add({
			body: {
				h1: [
					"<% if(this.developer) { %>",
					{ p: "I'm a developer" },
					"<% } %>"
				]
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<body><h1></h1></body>');
			done();
		}, {
			minify: true,
			developer: false
		})
	});

	xit("should use 'if/else' statement", function(done) {
		api.morph("html").add({
			body: {
				h1: [
					"<% if(this.developer) { %>",
					{ p: "I'm a developer" },
					"<% } else { %>",
					{ small: "Damn, I can't code!"},
					"<% } %>"
				]
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<body><h1><small>Damn, I can\'t code!</small></h1></body>');
			done();
		}, {
			minify: true,
			developer: false
		})
	});

	xit("should use 'switch' statement", function(done) {
		api.morph("html").add({
			body: [
				"<% switch(this.theme) { %>",
				"<% case 'black': %>",
				{ h1: "black"},
				"<% break; %>",
				"<% case 'blue': %>",
				{ h1: "blue"},
				"<% break; %>",
				"<% } %>"
			]
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<body><h1>blue</h1></body>');
			done();
		}, {
			minify: true,
			theme: "blue"
		})
	});

	it("should use for loop", function(done) {
		api.morph("html").add({
			body: {
				p: "Hello, my name is <%this.data.name%>!",
				small: "I'm \"<% this.data.profile.age %>\" {years} old",
				ul: [	
					'<% for(var i=0; i<this.data.skills.length, skill=this.data.skills[i]; i++) { %>',
					{
						li: {
							'a[href="#<% skill %>"]': 'I do <% skill %>'
						}
					},
					'<% } %>'
				]
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<body><p>Hello, my name is John!</p><small>I\'m "29" {years} old</small><ul><li><a href="#javascript">I do javascript</a></li><li><a href="#html">I do html</a></li><li><a href="#css">I do css</a></li></ul></body>');
			done();
		}, {
			minify: true,
			data: {
				name: "John",
				profile: { age: 29 },
				skills: ['javascript', 'html', 'css']
			}
		});
	});

	it("should accept normal html", function(done) {
		api.morph("html").add('<p><% this.data.name %>: <% this.data.skills.length %></p><ul><% for(var i=0; i<this.data.skills.length, skill=this.data.skills[i]; i++) { %><li><a href="#"><% skill %></a></li><% } %></ul>').compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<p>John: 3</p><ul><li><a href="#">javascript</a></li><li><a href="#">html</a></li><li><a href="#">css</a></li></ul>');
			done();
		}, {
			minify: true,
			data: {
				name: "John",
				skills: ['javascript', 'html', 'css']
			}
		});
	});

});