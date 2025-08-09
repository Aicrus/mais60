// Gerenciador simples para permitir landscape temporário (ex.: fullscreen de vídeo)

let temporaryLandscapeAllowed = false;

export const OrientationManager = {
  allowTemporaryLandscape() {
    temporaryLandscapeAllowed = true;
  },
  disallowTemporaryLandscape() {
    temporaryLandscapeAllowed = false;
  },
  isTemporaryLandscapeAllowed() {
    return temporaryLandscapeAllowed;
  },
};


