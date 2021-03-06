describe("Adding raw data", function() {

	var Absurd = require('../../index.js'),
		comment = "AbsurdJS is awesome!";

	it("should send raw data", function(done) {
		Absurd(function(api) {
			api
			.add({
				body: {
					marginTop: "20px"
				}
			})
			.raw('/* ' + comment + ' */')
			.add({
				a: {
					paddingTop: "20px"
				}
			})
			.raw('/* end of styles */');
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("body {\n  margin-top: 20px;\n}\n/* " + comment + " */\na {\n  padding-top: 20px;\n}\n/* end of styles */\n");
			done();
		});		
	});

});
describe("API(add)", function() {

	var Absurd = require('../../index.js');

	it("should use add", function(done) {
		Absurd(function(A) {
			A.add({
				'.absurd-title': {
					'border-radius': '10px'
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toContain(".absurd-title");
			expect(css).toContain("border-radius: 10px");
			done();
		});		
	});

});
describe("Avoid quoting of properties", function() {

	var Absurd = require('../../index.js');

	it("passing properties", function(done) {
		Absurd(function(api) {
			api.add({
				body: {
					paddingTop: "2px",
					WebkitTransform: "rotate(7deg)",
					fontWeight: "bold",
					"margin-top": "1px",
					".headerNavigation": {
						ABCDEFGHIJKLMNOPQRSTUVWXYZ: "20px"
					}
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("body {\n  padding-top: 2px;\n  -webkit-transform: rotate(7deg);\n  font-weight: bold;\n  margin-top: 1px;\n}\nbody .headerNavigation {\n  -a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z: 20px;\n}\n");
			done();
		});	
	});

});
describe("API(colors)", function() {

	var Absurd = require('../../index.js');

	it("should use darken", function(done) {
		Absurd(function(api) {
			api.add({
				body: {
					'color': api.darken('#BADA55', 25),
					'background': api.lighten('#BADA55', 25)
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toContain("color: #8ca440;");
			expect(css).toContain("background: #e9ff6a;");
			done();
		});		
	});

});
describe("Hooks", function() {

	var Absurd = require('../../index.js');

	it("Adding hook (add method)", function(done) {
		Absurd(function(api) {
			api.hook("add", function(rules, stylesheet) {
				expect(rules).toBeDefined();
				expect(stylesheet).not.toBeDefined();
				expect(rules.body).toBeDefined();
				expect(rules.body.fontSize).toBeDefined();
				expect(rules.body.fontSize).toBe("20px");
			}).add({
				body: {
					fontSize: "20px"
				}
			}).compile(function(err, css) {
				expect(css).toBe("body {\n  font-size: 20px;\n}\n");
				done();
			})
		});
	});

	it("Prevent default", function(done) {
		Absurd(function(api) {
			api.hook("add", function(rules, stylesheet) {
				return true;
			}).add({
				body: {
					fontSize: "20px"
				}
			}).compile(function(err, css) {
				expect(css).toBe("");
				done();
			})
		});
	});

	it("Adding hook (import method)", function(done) {
		Absurd(function(api) {
			api.hook("import", function(file) {
				if(file === "body-styles.bla") {
					api.add({
						body: {
							fontSize: "11.5px"
						}
					});
				}
			}).add({
				body: {
					fontSize: "20px"
				}
			}).import("body-styles.bla").compile(function(err, css) {
				expect(css).toBe("body {\n  font-size: 11.5px;\n}\n");
				done();
			})
		});
	});

	it("Adding hook (compile method)", function(done) {
		Absurd(function(api) {
			api.hook("compile", function(callback, options) {
				callback(null, "AbsurdJS is awesome!")
				return true;
			}).add({
				body: {
					fontSize: "20px"
				}
			}).import("body-styles.bla").compile(function(err, css) {
				expect(css).toBe("AbsurdJS is awesome!");
				done();
			})
		});
	});

});
describe("Media queries", function() {

	var Absurd = require('../../index.js');

	it("Media queries", function(done) {
		Absurd(function(api) {
			api.plugin("brand-color", function(api) {
				return { color: '#9fA' };
			})
			api.add({
				body: {
					'line-height': '20px',
					'@media all (max-width: 950px)': {
						'line-height': '40px',
						color: '#BADA55'
					},
					'@media all (min-width: 550px)': {
						'line-height': '32px'
					},
					p: {
						margin: '10px',
						padding: '4px',
						'@media all (max-width: 950px)': {
							padding: '12px',
							'brand-color': ''
						}
					}
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toContain("body {\n  line-height: 20px;\n}\nbody p {\n  margin: 10px;\n  padding: 4px;\n}\n@media all (max-width: 950px) {\nbody {\n  line-height: 40px;\n  color: #BADA55;\n}\nbody p {\n  color: #9fA;\n  padding: 12px;\n}\n}\n@media all (min-width: 550px) {\nbody {\n  line-height: 32px;\n}\n}\n");
			done();
		});		
	});

});
describe("Using mixins", function() {

	var Absurd = require("../../index.js");

	it("should use a mixin", function(done) {

		var absurd = Absurd();

		absurd.storage("button", function(color, thickness) {
			return {
				color: color,
				display: "inline-block",
				padding: "10px 20px",
				border: "solid " + thickness + "px " + color,
				'font-size': "10px"
			}
		});

		absurd.add({
			'.header-button': [
				absurd.storage("button")("#AAA", 10),
				{
					color: '#F00',
					'font-size': '13px'
				}
			]
		});

		absurd.compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toContain('font-size: 13px;');
			expect(css).toContain('color: #F00;');
			expect(css).not.toContain('color: #AAA;');
			done();
		})

	});

	it("should pass multiple values to storage", function(done) {
		var api = Absurd();
		api.storage({
			red: '#FF0000',
			green: '#00FF00',
			blue: '#0000FF',
			darkRed: '#550000',
			uselessMixin: function(v){
				return v;
			}
		});
		api.add({
			body: [
				{ color: api.storage("red") },
				{ background: api.storage("green") },
				api.storage("uselessMixin")({ width: "100%", height: "100%"})
			]
		});
		api.compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("body {\n\
  color: #FF0000;\n\
  background: #00FF00;\n\
  width: 100%;\n\
  height: 100%;\n\
}\n");
			done();
		})
	});

})
describe("Nested selectors", function() {

	var Absurd = require("../../index.js");

	it("should use nesting", function(done) {
		Absurd(function(api) {
			api.add({
				'.content': {
					p: {
						'font-size': '16px',
						'text-shadow': '2px 2px #00F',
						a: {
							'text-decoration': 'none'
						}
					}
				}
				
			})
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toContain('.content p');
			expect(css).toContain('.content p a');
			done();
		});
	});

});
describe("Optimize CSS", function() {

	var Absurd = require("../../index.js");

	it("should not include empty selectors", function(done) {
		Absurd(function(api){
			api.add({
				body: {
					
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe('');
			done();
		});
	});

	it("should add the property only once", function(done) {
		Absurd(function(api){
			api.add({
				body: {
					'font-size': '20px'
				}
			});
			api.add({
				body: {
					'font-size': '30px'
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe('body {\n  font-size: 30px;\n}\n');
			done();
		});
	});

	it("should combine selectors", function(done) {
		Absurd(function(api){
			api.add({
				body: {
					'font-size': '20px',
					'padding': '0'
				}
			});
			api.add({
				p: {
					'font-size': '20px',
					'margin': 0,
					'font-weight': 'bold',
					'line-height': '30px',
					'border': 'solid 1px #000'
				}
			});
			api.add({
				a: {
					'padding': '0 0 10px 0',
					'margin': 0,
					'border': 'solid 1px #000'
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toContain('body, p {\n  font-size: 20px;\n}\n');
			expect(css).toContain('p, a {\n  margin: 0;\n  border: solid 1px #000;\n}\n');
			done();
		});
	});

	it("should combine properties", function(done) {
		Absurd(function(api){
			api.add({
				body: {
					'font-size': '20px'
				}
			});
			api.add({
				body: {
					'padding': '30px'
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe('body {\n  font-size: 20px;\n  padding: 30px;\n}\n');
			done();
		});
	});

});
describe("Extending", function() {

	var Absurd = require('../../index.js');

	it("should create plugins", function(done) {
		Absurd(function(api) {
			api.plugin('my-custom-gradient', function(api, colors) {
				return {
					background: 'linear-gradient(to bottom, ' + colors.join(", ") + ')'
				};
			});
			api.plugin('brand-font-size', function(api, type) {
				switch(type) {
					case "small": return { 'font-size': '12px'}; break;
					case "medium": return { 'font-size': '22px'}; break;
					case "big": return { 'font-size': '32px'}; break;
					default: return { 'font-size': '12px'}; break;
				}
			});
			api.add({
				body: {
					margin: '20px',
					'font-size': '14px',
					'my-custom-gradient': ['#F00', '#00F'],
					p: {
						'brand-font-size': 'big'	
					}					
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe('body {\n  margin: 20px;\n  font-size: 14px;\n  background: linear-gradient(to bottom, #F00, #00F);\n}\nbody p {\n  font-size: 32px;\n}\n');
			done();
		});		
	});

	it("should create plugin which depends on other plugin", function(done) {
		Absurd(function(api) {
			api.plugin('my-custom-gradient', function(api, colors) {
				return {
					background: 'linear-gradient(to bottom, ' + colors.join(", ") + ')',
					'brand-font-size': 'small'
				};
			});
			api.plugin('brand-font-size', function(api, type) {
				switch(type) {
					case "small": return { 'font-size': '12.5px', 'brand-color': ''}; break;
					case "medium": return { 'font-size': '22px', 'brand-color': ''}; break;
					case "big": return { 'font-size': '32px', 'brand-color': ''}; break;
					default: return { 'font-size': '12px', 'brand-color': ''}; break;
				}
			});
			api.plugin('brand-color', function(api) {
				return { color: '#09f' };
			})
			api.add({
				body: {
					margin: '20px',
					color: '#FAA',
					'font-size': '14px',
					'my-custom-gradient': ['#F00', '#00F']
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe('body {\n  margin: 20px;\n  color: #09f;\n  font-size: 12.5px;\n  background: linear-gradient(to bottom, #F00, #00F);\n}\n');
			done();
		});	
	});

});
describe("Shoud prevent camel case transformation", function() {

	it("keep camel case", function(done) {
		var api = require("../../index.js")();
		api.add({
			body: {
				lineHeight: "20px"
			}
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("body {\n  lineHeight: 20px;\n}\n");
			done();
		}, { keepCamelCase: true })
	});

});
describe("Pseudo classes", function() {

	var Absurd = require("../../index.js");

	it("should use pseudo classes", function(done) {
		Absurd(function(A) {
			A.add({
				a: {
					'text-decoration': 'none',
					'color': '#000',
					':hover': {
						'text-decoration': 'underline',
						'color': '#999'
					},
					':before': {
						content: '"> "'
					}
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toContain('a:hover {');
			expect(css).toContain('a:before {');
			done();
		});
	});

});
describe("Register api method", function() {

	var Absurd = require('../../index.js');

	it("should register toJSON API method", function(done) {
		Absurd(function(api) {
			api.register("toJSON", function(callback) {
				api.compile(
					callback, 
					{ 
						processor: function(rules, callback) {
							var filterRules = function(r) {
								for(var prop in r) {
									if(typeof r[prop] === "object") {
										filterRules(r[prop]);
									} else if(r[prop] === false) {
										delete r[prop];
									}
								}
							}
							filterRules(rules)
							callback(null, rules);
						}
					}
				);
			}).add({
				section: {
					margin: 0,
					padding: "20px",
					a: {
						padding: "20px"
					}
				}
			}).toJSON(function(err, json) {
				expect(json).toBeDefined();
				expect(err).toBe(null);
				expect(typeof json).toBe("object");
				expect(json.mainstream.section.padding).toBe("20px");
				done();
			})
		});
	});

});
describe("Use ampersand operator", function() {

	var api = require('../../index.js')();

	it("should use add", function(done) {
		api.add({
			a: {
				color: 'red',
				':hover': { color: 'blue' },
				'&.fancy': { color: 'green' }
			}
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("a {\n  color: red;\n}\na:hover {\n  color: blue;\n}\na.fancy {\n  color: green;\n}\n");
			done();
		})
	});
	
	it("should replace all ampersand with parent selector", function(done) {
		api.add({
			a: {
				color: 'red',
				':hover': { color: 'blue' },
				'&.fancy': { color: 'green' },
				'.ie6 &:hover, .ie7 &:hover': { color: 'orange' },
				'.ie6 &.fancy': { color: 'yellow' },
				'.ie7 &.fancy': { color: 'black' }
			}
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("a{color: red;}a:hover{color: blue;}a.fancy{color: green;}.ie6 a.fancy{color: yellow;}.ie7 a.fancy{color: black;}.ie6 a:hover,.ie7 a:hover{color: orange;}");
			done();
		}, { minify: true })
	});

});
describe("Using functions inside the json file", function() {

	var Absurd = require("../../index.js");

	it("should not include empty selectors", function(done) {
		Absurd(function(api){
			api.add({
				body: {
					p: {
						fontSize: function() {
							return "10px"
						}
					}
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("body p {\n  font-size: 10px;\n}\n")
			done();
		});
	});

});
describe("Fixing allow empty values - ", function() {

	var Absurd = require('../../index.js');

	it("should use empty value", function(done) {
		Absurd(function(api) {
			api.add({
				section: {
					":after": {
						content: ""
					}
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("section:after {\n  content: \"\";\n}\n");
			done();
		});		
	});

});
describe("Fixing bug with ampersand inside a plugin", function() {

	var api = require('../../index.js')();

	it("should use remove the ampersand prop", function(done) {
		api.plugin("hoverEffect", function(api, color) {
		    return {
		        "&:hover": {
		            color: color,
		            background: api.lighten(color, 60),
		            ".ie8 &": {
		            	color: "blue"
		            }
		        },
		        ".ie8 &": {
		            color: "#eee"
		        }
		    };
		});
		api.add({
		    a: {
		        color: "#000",
		        hoverEffect: "#999"
		    }
		});
		api.compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("a {\n\
  color: #000;\n\
}\n\
a:hover {\n\
  color: #999;\n\
  background: #f5f5f5;\n\
}\n\
.ie8 a:hover {\n\
  color: blue;\n\
}\n\
.ie8 a {\n\
  color: #eee;\n\
}\n");
			done();
		});		
	});

});
describe("Fixing bug in array usage", function() {

	var Absurd = require('../../index.js');
	var themeColor = "#BADA55";
	var textStyles = function(size) {
		return {
			color: themeColor,
			fontSize: size + "px",
			lineHeight: size + "px"
		}
	}

	it("should use array", function(done) {
		Absurd(function(api) {
			api.add({
				body: {
					color: themeColor,
					p: textStyles(16),
					h1: [
						textStyles(50),
						{
							lineHeight: "60px"
						} 
					]
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("body, body p, body h1 {\n  color: #BADA55;\n}\nbody p {\n  font-size: 16px;\n  line-height: 16px;\n}\nbody h1 {\n  font-size: 50px;\n  line-height: 60px;\n}\n");
			done();
		});		
	});

});
describe("Allow usage of keepCamelCase", function() {

	var api = require('../../index.js')();

	it("should use keepCamelCase", function(done) {
		api.morph("html").add({
			testProperty: {
				SomeElement: "text here"
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe("<testProperty><SomeElement>text here</SomeElement></testProperty>");
			done();
		}, {keepCamelCase: true, minify: true});		
	});

});
describe("Media queries bugs", function() {

	var api = require('../../index.js')();

	it("should compile media queries properly", function(done) {
		api.add({
			'@media screen and (max-width: 767px)': {
		        a: { color:'red', },
		        div: { color:'blue', },
		        '.some-class': { color:'green' }
		    }
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("@media screen and (max-width: 767px) {a{color: red;}div{color: blue;}.some-class{color: green;}}");
			done();
		}, { minify: true });
	});

	it("should compile media queries properly", function(done) {
		api.add({
			section: {
				'.widget': {
					fontSize: '20px',
					'@media screen and (max-width: 767px)': {
						fontSize: '30px'
					}
				},
				p: {
					'@media screen and (max-width: 767px)': {
						a: { color: 'red' },
						'@media screen and (max-width: 200px)': {
							span: { lineHeight: '10px' }
						}
					}
				}
			},
			'@media screen and (max-width: 767px)': {
		        a: { color:'red', },
		        div: { color:'blue', },
		        '.some-class': { color:'green' }
		    }
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("section .widget{font-size: 20px;}@media screen and (max-width: 767px) {section .widget{font-size: 30px;}section p a,a{color: red;}div{color: blue;}.some-class{color: green;}}@media screen and (max-width: 200px) {section p span{line-height: 10px;}}");
			done();
		}, { minify: true });
	});

});
describe("Morph, flush usage /", function() {

	var api = require('../../index.js')();

	it("should compile to css", function(done) {
		api.add({
			body: { margin: "20px" }
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("body {\n  margin: 20px;\n}\n");
			done();
		});		
	});

	it("should compile to html", function(done) {
		api.morph("html").add({
			body: { p: "text" }
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe("<body><p>text</p></body>");
			done();
		}, { minify: true });		
	});

	it("should compile to css again", function(done) {
		api.add({
			body: { padding: "20px" }
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("body {\n  padding: 20px;\n}\n");
			done();
		});		
	});

});
describe("Allow nested objects in arrays", function() {

	var api = require('../../index.js')();

	it("use nested objects in array", function(done) {
		api.add({
		    body: [
		    	{ width: '80px' },
		    	{ span: { display: 'inline' } },
		    	{ 
		    		section: {
		    			fontSize: "23px"
		    		},
		    		ul: [
		    			{ margin: "10px" },
		    			{ a: { color: "blue" } },
		    			{ padding: "20px" }
		    		]
		    	}
		    ]
	}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("body{width: 80px;}body span{display: inline;}body section{font-size: 23px;}body ul{margin: 10px;padding: 20px;}body ul a{color: blue;}");
			done();
		}, {minify: true});
	});

});
describe("Fixing bug in array usage", function() {

	var Absurd = require('../../index.js');

	it("should use array", function(done) {
		Absurd(function(api) {
			api.plugin("hoverEffect", function(api, color) {
				return {
					":hover": {
						color: color
					}
				}
			})
			api.add({
				a: {
					color: "#000",
					hoverEffect: "#999"
				}
			});
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("a {\n  color: #000;\n}\na:hover {\n  color: #999;\n}\n");
			done();
		});		
	});

});
describe("Multiple selectors per rule overwrite all individual selectors", function() {

	var api = require('../../index.js')();

	it("should compile properly", function(done) {
		api.add({
			'html, body': { color:'red' },
		    'body': { background:'blue' },
		    'html': { background:'pink' }
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("body{background: blue;}html{background: pink;}body,html{color: red;}");
			done();
		}, { minify: true });
	});

});
describe("Support comma separated selectors", function() {

	var api = require('../../index.js')();

	it("Support comma separated selectors", function(done) {
		api.add({
			"body, section, h1": {
				padding: "20px",
				"b, i": { fontSize: "20px"}
			}
		}).compile(function(err, css) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(css).toBe("body,section,h1{padding: 20px;}body b,body i,section b,section i,h1 b,h1 i{font-size: 20px;}");
			done();
		}, {minify: true});
	});

});
describe("Componenting", function() {

	var api = require('../../../index.js')();

	it("should define component and compile it", function(done) {
		var component = {
			css: {
				"#widget": {
					width: "200px",
					padding: "30px 10px",
					background: "#aaa",
					a: {
						fontSize: "20px",
						textDecoration: "none"
					}
				}
			},
			html: {
				"div[id=\"widget\"]": {
					p: {
						"a[href=\"http://bla.com\"]": "share"
					}
				}
			}
		};
		api.morph("component").add(component).compile(function(err, css, html) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(html).toBeDefined();
			expect(css).toBe('#widget{width: 200px;padding: 30px 10px;background: #aaa;}#widget a{font-size: 20px;text-decoration: none;}')
			expect(html).toBe('<div id="widget"><p><a href="http://bla.com">share</a></p></div>')
			done();
		}, { minify: true });
	});

	it("should use a function instead of object", function(done) {
		var component = function() {
			return {
				css: {
					".login-link": { color: "red"}
				},
				html: {
					'a.login-link': "Please login"
				}
			}
		}
		api.morph("component").add(component).compile(function(err, css, html) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(html).toBeDefined();
			expect(css).toBe(".login-link{color: red;}");
			expect(html).toBe('<a class="login-link">Please login</a>');
			done();
		}, { minify: true })
	});

	it("should compile several components", function(done) {
		var componentA = function() {
			return {
				css: {
					".login-link": { color: "red", fontSize: "16px" }
				},
				html: {
					'a.login-link': "Please login"
				}
			}
		}
		var componentB = function() {
			return {
				css: {
					".logout-link": { color: "red", fontSize: "11px" }
				},
				html: {
					'a.logout-link': "Logout"
				}
			}
		}
		api.morph("component").add([componentA, componentB]).compile(function(err, css, html) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(html).toBeDefined();
			expect(css).toBe(".login-link,.logout-link{color: red;}.login-link{font-size: 16px;}.logout-link{font-size: 11px;}");
			expect(html).toBe('<a class="login-link">Please login</a><a class="logout-link">Logout</a>');
			done();
		}, { minify: true })
	});

});
describe("Componenting", function() {

	var api = require('../../../index.js')();

	it("should define component and compile it with data", function(done) {
		var component = {
			css: {
				"#widget": {
					width: "200px",
					padding: "30px 10px",
					background: "#aaa",
					a: {
						fontSize: "20px",
						textDecoration: "none"
					}
				}
			},
			html: {
				"div[id=\"widget\"]": {
					p: {
						"a[href=\"http://bla.com\"]": "<% this.data.label %>"
					}
				}
			}
		};
		api.morph("component").add(component).compile(function(err, css, html) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(html).toBeDefined();
			expect(css).toBe('#widget{width: 200px;padding: 30px 10px;background: #aaa;}#widget a{font-size: 20px;text-decoration: none;}')
			expect(html).toBe('<div id="widget"><p><a href="http://bla.com">link label</a></p></div>')
			done();
		}, { minify: true,  data: { label: "link label"} });
	});

});
describe("Nested components", function() {

	var api = require('../../../index.js')();

	it("should use a nested components", function(done) {
		var head = function() {
			return {
				css: {
					body: {
						width: "100%",
						height: "100%",
						margin: "10px",
						padding: "0px"
					}
				},
				html: {
					head: {
						title: "That's my page"
					}
				}
			};
		}
		var title = {
			css: {
				".title": {
					fontSize: "24px"
				}
			},
			html: {
				"h1.title": "Hello world"
			}
		}
		var body = function() {
			return {
				css: {
					h1: { fontWeight: "normal" },
					p: { fontSize: "24px", lineHeight: "28px" }
				},
				html: {
					body: {
						_include: title,
						p: "Text of the <b>page</b>."
					}
				}
			}
		}
		var page = function() {
			return {
				css: {
					body: {
						margin: "0px",
						section: {
							marginTop: "20px",
							"@media all and (max-width: 640px)": {
								marginTop: "10px"
							}
						}
					}
				},
				html: {
					_: "<!DOCTYPE html>",
					html: {
						_include: [head, body]
					}
				}
			}
		}
		api.morph("component").add(page).compile(function(err, css, html) {
			expect(err).toBe(null);
			expect(css).toBeDefined();
			expect(html).toBeDefined();
			expect(css).toBe("body{margin: 10px;width: 100%;height: 100%;padding: 0px;}body section{margin-top: 20px;}h1{font-weight: normal;}p,.title{font-size: 24px;}p{line-height: 28px;}@media all and (max-width: 640px) {body section{margin-top: 10px;}}");
			expect(html).toBe('<!DOCTYPE html><html><head><title>That\'s my page</title></head><body><h1 class="title">Hello world</h1><p>Text of the <b>page</b>.</p></body></html>');
			done();
		}, { minify: true })
	});

});
describe("Metamorphosis (to html preprocessor)", function() {

	var api = require('../../../index.js')();

	it("should compile nested tags", function(done) {
		var headTags = [
			{ title: "page title" },
			{ style: {} }
		];
		api.morph("html").add({
			html: {
				head: headTags,
				body: {}
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<html><head><title>page title</title><style/></head><body/></html>');
			done();
		}, { minify: true });
	});

	it("should compile list", function(done) {
		api.morph("html").add({
			html: {
				body: {
					ul: [
						{ li: 'A' },
						{ li: 'B' },
						{ li: 'C' },
						{ li: 'D' }
					]
				}
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<html><body><ul><li>A</li><li>B</li><li>C</li><li>D</li></ul></body></html>');
			done();
		}, { minify: true });
	});

	it("should compile array of strings", function(done) {
		api.morph("html").add({
			html: [
				'<body>',
				'<h1>Title</h1>',
				'</body>'
			]
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<html><body><h1>Title</h1></body></html>');
			done();
		}, { minify: true });
	});

});
describe("Metamorphosis (to html preprocessor)", function() {

	var api = require('../../../index.js')();

	it("complex html", function(done) {
		api.morph("html").add({
			_:'<!DOCTYPE html>',
			html: {
				head: {
					title: "html page",
					meta: {
						_attrs: {
							httpEquiv: "Content-Type",
							content: "text/html; charset=utf-8"
						}
					}
				},
				body: {
					_attrs: { class: "home-page" },
					section: {
						h1: "that's html page"
					}
				}
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<!DOCTYPE html><html><head><title>html page</title><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/></head><body class="home-page"><section><h1>that\'s html page</h1></section></body></html>');
			done();
		}, { minify: true });
	});

});
describe("Metamorphosis (to html preprocessor)", function() {

	var api = require('../../../index.js')();

	it("complex html", function(done) {
		var inputField = function(name, defaultValue) {
			return {
				input: {
					_attrs: {
						type: "text",
						placeholder: defaultValue,
						name: name
					}
				}
			}
		}
		var submit = function(value) {
			return {
				input: {
					_attrs: {
						type: "submit",
						value: value || "submit the data"
					}
				}
			}
		}
		api.morph("html").add({
			html: {
				head: {
					title: "html page"
				},
				body: {
					form: [
						{ _: "<label>Please fill the form</label>"},
						inputField("username", "Please type your username"),
						inputField("email", "Please type your email"),
						submit
					]
				}
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<html><head><title>html page</title></head><body><form><label>Please fill the form</label><input type="text" placeholder="Please type your username" name="username"/><input type="text" placeholder="Please type your email" name="email"/><input type="submit" value="submit the data"/></form></body></html>');
			done();
		}, { minify: true });
	});

});
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
describe("Metamorphosis (to html preprocessor)", function() {

	var api = require('../../../index.js')();

	it("should use function", function(done) {
		var getTitleTag = function(value) {
			return {
				title: value
			}
		}
		var bodyContent = function() {
			return {
				p: "text"
			}
		}
		api.morph("html").add({
			html: {
				head: getTitleTag("Absurd is awesome"),
				body: bodyContent
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<html><head><title>Absurd is awesome</title></head><body><p>text</p></body></html>');
			done();
		}, { minify: true });
	});

});
describe("Metamorphosis (to html preprocessor)", function() {

	var api = require('../../../index.js')();

	it("should use _include", function(done) {
		var profile = function() {
			return {
				".profile": {
					"span.name": "John Doe"
				}
			}
		}
		var logo = {
			".logo": {
				'img[src="#"]': {}
			}
		}
		var nav = {
			nav: [
				{ 'a[href="#"]': "Home" },
				{ 'a[href="#"]': "Products" },
				{ 'a[href="#"]': "Contacts" }
			]
		}
		var header = {
			header: {
				_include: [logo, nav, profile]
			}
		}
		var page = {
			html: {
				body: {
					_include: header
				}
			}
		}
		api.morph("html").add(page).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<html><body><header><div class="logo"><img src="#"/></div><nav><a href="#">Home</a><a href="#">Products</a><a href="#">Contacts</a></nav><div class="profile"><span class="name">John Doe</span></div></header></body></html>');
			done();
		}, { minify: true });
	});

});
describe("Metamorphosis (to html preprocessor)", function() {

	var api = require('../../../index.js')();

	it("should minify html", function(done) {
		api.morph("html").add({
			body: {
				header: "header",
				section: [
					{ p: "test" },
					{ p: "lorem ipsum" },
					{ img: {} }
				]
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<body><header>header</header><section><p>test</p><p>lorem ipsum</p><img/></section></body>');
			done();
		}, { minify: true });
	});

});
describe("Metamorphosis (to html preprocessor)", function() {

	var api = require('../../../index.js')();

	it("should compile an empty tag", function(done) {
		api.morph("html").add({
			body: {}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<body/>');
			done();
		}, { minify: true });
	});

	it("should compile tag with text inside", function(done) {
		api.morph("html").add({
			body: "page text"
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<body>page text</body>');
			done();
		}, { minify: true });
	});

	it("should compile tag with attributes", function(done) {
		api.morph("html").add({
			body: {
				_attrs: { class: "black" }
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<body class="black"/>');
			done();
		}, { minify: true });
	});

	it("should compile tag with attributes and text inside", function(done) {
		api.morph("html").add({
			body: {
				_attrs: { class: "black" },
				_: "page text"
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<body class="black">page text</body>');
			done();
		}, { minify: true });
	});

	it("should compile tag with attributes, text inside and nested tag", function(done) {
		api.morph("html").add({
			body: {
				_attrs: { class: "black" },
				_: "page text",
				p: "paragraph text"
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<body class="black">page text<p>paragraph text</p></body>');
			done();
		}, { minify: true });
	});

	it("should compile raw content", function(done) {
		api.morph("html").add({
			_: '<html></html>'
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<html></html>');
			done();
		}, { minify: true });
	});	

	it("should compile nested tags", function(done) {
		api.morph("html").add({
			html: {
				head: {
					title: "title"
				},
				body: {}
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<html><head><title>title</title></head><body/></html>');
			done();
		}, { minify: true });
	});

	it("should compile raw content + nested tag", function(done) {
		api.morph("html").add({
			body: {
				p: {
					_: "That's my text",
					a: {
						_: "read more",
						_attrs: { href: "#"}
					}
				}
			}
		}).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<body><p>That\'s my text<a href="#">read more</a></p></body>');
			done();
		}, { minify: true });
	});

});
describe("Metamorphosis (to html preprocessor)", function() {

	var api = require('../../../index.js')();

	it("should use templates", function(done) {

		api.morph("html").add({
			title: "AbsurdJS preprocessor"
		}, "title");

		api.add({
			a: {
				_: "link",
				_attrs: {
					href: "#",
					target: "_blank"
				}
			}
		}, "link");

		api.add({
			footer: {
				_: "footer text"
			}
		}, "footer");

		api.add({
			html: {
				head: {
					_tpl: "title"
				},
				body: {
					_: "<h1>oh yeah</h1>",
					_tpl: ["link", "footer"]
				}
			}
		})

		api.compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<html><head><title>AbsurdJS preprocessor</title></head><body><h1>oh yeah</h1><a href="#" target="_blank">link</a><footer>footer text</footer></body></html>');
			done();
		}, { minify: true });
	});

});
describe("Metamorphosis (to html preprocessor)", function() {

	var api = require('../../../index.js')();

	it("should use classes", function(done) {
		var tags = {
			"div.content": {
				p: "text"
			}
		}
		api.morph("html").add(tags).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<div class="content"><p>text</p></div>');
			done();
		}, { minify: true });
	});

	it("should use two classes", function(done) {
		var tags = {
			"div.content.left": {
				p: "text"
			}
		}
		api.morph("html").add(tags).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<div class="content left"><p>text</p></div>');
			done();
		}, { minify: true });
	});

	it("should use id", function(done) {
		var tags = {
			"div#content": {
				p: "text"
			}
		}
		api.morph("html").add(tags).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<div id="content"><p>text</p></div>');
			done();
		}, { minify: true });
	});

	it("should use id and class together", function(done) {
		var tags = {
			"div.content#home.left": {
				p: "text"
			}
		}
		api.morph("html").add(tags).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<div class="content left" id="home"><p>text</p></div>');
			done();
		}, { minify: true });
	});

	it("should use without tag name", function(done) {
		var tags = {
			".content#home.left": {
				p: "text"
			}
		}
		api.morph("html").add(tags).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<div class="content left" id="home"><p>text</p></div>');
			done();
		}, { minify: true });
	});

	it("should pass attributes", function(done) {
		var tags = {
			'.content[data-behaviour="clickable" title="test" style="position: absolute; top: 20px; left: 30px;"]#home': {
				'img[alt="that\'s my image" some__data="1"]': {}
			}
		}
		api.morph("html").add(tags).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<div class="content" id="home" data-behaviour="clickable" title="test" style="position: absolute; top: 20px; left: 30px;"><img alt="that\'s my image" some__data="1"/></div>');
			done();
		}, { minify: true });
	});

	it("should pass attributes", function(done) {
		var tags = {
			'.content.left#wrapper': {
				'a[href="http://krasimir.github.io/absurd/"]': "AbsurdJS documentation",
				'p.text[title="description" data-type="selectable"]': "CSS preprocessor"
			}
		}
		api.morph("html").add(tags).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<div class="content left" id="wrapper"><a href="http://krasimir.github.io/absurd/">AbsurdJS documentation</a><p class="text" title="description" data-type="selectable">CSS preprocessor</p></div>');
			done();
		}, { minify: true });
	});

	it("should create a div by default", function(done) {
		var tags = {
			'[class="content"]': "test"
		}
		api.morph("html").add(tags).compile(function(err, html) {
			expect(err).toBe(null);
			expect(html).toBeDefined();
			expect(html).toBe('<div class="content">test</div>');
			done();
		}, { minify: true });
	});

});