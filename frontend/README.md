# Tests Fulll


## Informations
Pour le style de l'app j'ai utilisé les [Module CSS](https://vite.dev/guide/features.html#css-modules) supportés par Vite. 
Afin de réduire au maximum le nombre de librairies utilisées dans l'application j'utilise la [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) pour les appels HTTP.

## Lancement de l'app
```shell
npm install
npm run dev
```

## Lancement des tests
```shell
npm install
npm run test
```

---

## Axes d'améliorations

### Gestion des requêtes
Pour améliorer la qualité de code, j'aurais tendance à utiliser `@tanstack/react-query` pour la gestion des appels API : ça m'aurais évité
de devoir déclarer des `useState` pour mes états "erreur", "loading", etc ... De plus "react-query" m'aurait offert la possibilité d'avoir
du cache géré de manière efficace et simple directement côté navigateur.

### Gestion du style
Pour réduire la quantité de code pour le style, j'aurais tendance à utiliser SCSS, [Tailwind](https://tailwindcss.com/), mais également [Shadcn/ui](https://ui.shadcn.com/) pour générer les composants 
de base du design system.