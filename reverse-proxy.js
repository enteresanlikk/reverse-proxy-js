const dependencies = {
  styles: {
    inline: [],
    global: [
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css',
    ],
  },
  headScripts: {
    inline: [],
    global: [
      'https://code.jquery.com/jquery-3.7.1.min.js',
    ],
  },
  bodyScripts: {
    inline: [
      `console.log('Hello from inline script')`
    ],
    global: [],
  },
};

const data = {
  domain: 'http://localhost:3000',
  components: {
    header: {
      logo: 'http://localhost:3000/logo.png',
      menu_items: [
        {
          slug: 'home',
          name: 'Home',
          url: '/',
        },
        {
          slug: 'about',
          name: 'About',
          url: '/about',
        },
        {
          slug: 'contact',
          name: 'Contact',
          url: '/contact',
        }
      ]
    },
    footer: {
      slogan: 'This is the footer slogan',
    }
  },
  css: `
    body {
      background-color: #f0f0f0;
    }
  `,
  languages: [
    {
      slug: 'fr',
      name: 'Français',
    },
    {
      slug: 'en',
      name: 'English',
    },
  ],
  resource: {
    copyright: 'Copyright 2024'
  },
};

const components = [
  {
    name: 'header',
    htmls: {
      main(data) {
        return `
          <header class="p-3">
            <nav class="container d-flex justify-content-between">
              <ul class="list-unstyled d-flex gap-3">
                ${
                  data.menu_items.map((item) => {
                    return `
                      <li>
                        <a href="${ reverseProxy.createURL(item.url) }" target="_blank" rel="noreferrer">
                          ${ item.name }
                        </a>
                      </li>
                    `;
                  }).join('')
                }
              </ul>
              <ul class="list-unstyled d-flex gap-3">
                ${
                    reverseProxy.data.languages.map((language) => {
                      return `
                        <li>
                          <a href="${ reverseProxy.createURL(`/${ language.slug }`) }" target="_blank" rel="noreferrer">
                            ${ language.name }
                          </a>
                        </li>
                      `;
                    }).join('')
                  }
              </ul>
            </nav>
          </header>
        `;
      },
    },
  },
  {
    name: 'footer',
    htmls: {
      main(data) {
        return `
          <footer>
            <div class="container">
              <p>${data.slogan}</p>
              <p class="small text-center">${reverseProxy.data.resource.copyright}</p>
            </div>
          </footer>
        `;
      },
    },
  },
];

const reverseProxy = ((dependencies, data, components) => {
  const init = () => {
    renderComponents(data.components);

    dependencies.styles.inline.push(data.css);
    renderStyles(dependencies.styles);
    renderHeadScripts(dependencies.headScripts);
    renderBodyScripts(dependencies.bodyScripts);
  }

  const createURL = (url) => {
    if (!url) {
      return 'javascript:;';
    }
    if (url.indexOf('://') != -1) {
      return url;
    }

    return `${reverseProxy.data.domain}${url}`;
  }

  const createScript = (src) => {
    const el = document.createElement('script');
    el.src = createURL(src);
    return el;
  }

  const createInlineScript = (script) => {
    const el = document.createElement('script');
    el.innerHTML = script;
    return el;
  }

  const createStylesheet = (href) => {
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = createURL(href);
    return el;
  }

  const createStyle = (css) => {
    const el = document.createElement('style');
    el.innerHTML = css;
    return el;
  }

  const renderHeadScripts = (list = []) => {
    if (list.inline) {
      list.inline.map((script) => {
        const html = createInlineScript(script);
        document.head.append(html);
      });
    }

    list.global.map((src) => {
      const html = createScript(src);
      document.head.append(html);
    });
  }

  const renderBodyScripts = (list = []) => {
    if (list.inline) {
      list.inline.map((script) => {
        const html = createInlineScript(script);
        document.body.append(html);
      });
    }

    list.global.map((src) => {
      const html = createScript(src);
      document.body.append(html);
    });
  }

  const renderStyles = (list = []) => {
    if (list.inline) {
      list.inline.map((css) => {
        const html = createStyle(css);
        document.head.prepend(html);
      });
    }

    list.global.map((href) => {
      const html = createStylesheet(href);
      document.head.prepend(html);
    });
  }

  const renderComponents = (componentDatas) => {
    const keys = Object.keys(componentDatas);
    keys.map((key) => {
      const data = componentDatas[key];
      const component = components.find((c) => c.name === key);

      if (!component) {
        console.info(`${key} component HTML is missing.`);
        return;
      }

      renderComponent(component, data);
    });
  }

  const renderComponent = (component, data) => {
    const element = document.querySelector(`[data-component="${component.name}"]`);

    if (!element) {
      console.info(`${component.name} element is missing.`);
      return;
    }

    const html = component.htmls.main(data);

    if (!html) {
      console.info(`There is a ${component.name} element but no HTML.`);
      return;
    }

    element.outerHTML = html;
  }

  return {
    init,
    createURL,
    data,
  }
})(dependencies, data, components);

document.addEventListener('DOMContentLoaded', function () {
  reverseProxy.init();
});
