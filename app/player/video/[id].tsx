import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Platform, ActivityIndicator, Image, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/DesignSystemContext';
import { colors } from '@/design-system/tokens/colors';
import { fontFamily as dsFontFamily, getResponsiveValues } from '@/design-system/tokens/typography';
import { ChevronLeft, Play, Pause, Maximize2, X, Heart } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function VideoPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  const titleType = getResponsiveValues('title-md');
  const bodyType = getResponsiveValues('body-lg');

  const videoId = useMemo(() => {
    const raw = (id || '').toString();
    // Se o id parece um ID válido do YouTube, usa; senão, fallback
    return /^[a-zA-Z0-9_-]{6,}$/.test(raw) ? raw : 'dQw4w9WgXcQ';
  }, [id]);

  const webviewRef = useRef<WebView>(null);
  const fsWebviewRef = useRef<WebView>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fsStartAt, setFsStartAt] = useState<number>(0);
  const [fsAutoPlay, setFsAutoPlay] = useState<boolean>(true);
  const [isLandscapeDevice, setIsLandscapeDevice] = useState<boolean>(false);
  const [pendingFsClose, setPendingFsClose] = useState<boolean>(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Tempos de espera de rotação, ajustados por plataforma
  const LANDSCAPE_ROTATION_TIMEOUT_MS = Platform.OS === 'ios' ? 500 : 900;
  const PORTRAIT_ROTATION_TIMEOUT_MS = Platform.OS === 'ios' ? 500 : 900;

  // Reforça retrato nesta tela
  useEffect(() => {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    }
    return () => {
      if (Platform.OS !== 'web') {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      }
    };
  }, []);
  const [embedMode, setEmbedMode] = useState<'privacy' | 'standard'>('privacy');
  const [playerVisible, setPlayerVisible] = useState<boolean>(false);

  // Oculta o WebView durante qualquer transição/fallback de modo
  useEffect(() => {
    setPlayerVisible(false);
  }, [embedMode, videoId]);

  const html = useMemo(() => {
    const id = videoId;
    const host = embedMode === 'privacy' ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com';
    const controlsValue = 0;
    return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <link rel="preconnect" href="https://www.youtube.com" />
    <link rel="preconnect" href="https://i.ytimg.com" />
    <link rel="preconnect" href="https://s.ytimg.com" />
    <link rel="dns-prefetch" href="https://www.youtube.com" />
    <link rel="dns-prefetch" href="https://i.ytimg.com" />
    <link rel="dns-prefetch" href="https://s.ytimg.com" />
    <link rel="preload" as="script" href="https://www.youtube.com/iframe_api" />
    <style>html,body,#player{height:100%;margin:0;background:#000;overflow:hidden}</style>
  </head>
  <body>
    <div id="player"></div>
    <script>
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      var player;
      function post(msg){
        if(window.ReactNativeWebView){ window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }
      }
      function onYouTubeIframeAPIReady(){
           player = new YT.Player('player', {
          height: '100%', width: '100%', videoId: '${id}',
          playerVars: {
            playsinline: 1,
            autoplay: 0,
            controls: ${controlsValue},
            rel: 0,
            modestbranding: 1,
            fs: 0,
            disablekb: 1,
            iv_load_policy: 3
          },
          host: '${host}',
          events: {
            'onReady': function(){ try { player.unMute(); } catch(e) {} post({ type: 'ready' }); },
            'onStateChange': function(e){ post({ type: 'state', data: e.data }); },
            'onError': function(e){ post({ type: 'error', data: e.data }); }
          }
        });
      }
      window.playVideo = function(){ if(player){ try{ player.unMute(); }catch(e){} player.playVideo(); } };
      window.pauseVideo = function(){ if(player){ player.pauseVideo(); } };
      window.togglePlay = function(){ if(!player) return; var s = player.getPlayerState(); if(s===1){ player.pauseVideo(); } else { try{ player.unMute(); }catch(e){} player.playVideo(); } };
      window.seekBy = function(sec){ if(!player) return; var t = player.getCurrentTime(); player.seekTo(t + sec, true); };
      window.requestFullscreenPlayer = function(){ var iframe = player && player.getIframe ? player.getIframe() : null; var el = iframe || document.getElementById('player'); if(el && el.requestFullscreen){ el.requestFullscreen(); } };
      window.getState = function(){
        try {
          if(!player){ post({ type: 'current', data: { time: 0, state: 2 } }); return; }
          var t = player.getCurrentTime();
          var s = player.getPlayerState();
          post({ type: 'current', data: { time: t, state: s } });
        } catch (e) { post({ type: 'current', data: { time: 0, state: 2 } }); }
      };
    </script>
  </body>
</html>`;
  }, [videoId, embedMode]);

  const sendJS = useCallback((js: string) => {
    webviewRef.current?.injectJavaScript(js + '; true;');
  }, []);

  const sendFsJS = useCallback((js: string) => {
    fsWebviewRef.current?.injectJavaScript(js + '; true;');
  }, []);

  const waitForLandscape = useCallback(async (timeoutMs?: number) => {
    if (Platform.OS === 'web') return;
    try {
      const effectiveTimeout = typeof timeoutMs === 'number' ? timeoutMs : LANDSCAPE_ROTATION_TIMEOUT_MS;
      const isLandscape = (o: ScreenOrientation.Orientation | null) => (
        o === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
      );
      const current = await ScreenOrientation.getOrientationAsync();
      if (isLandscape(current)) return;
      await new Promise<void>((resolve) => {
        let resolved = false;
        const tid = setTimeout(() => {
          if (!resolved) { resolved = true; resolve(); }
        }, effectiveTimeout);
        const sub = ScreenOrientation.addOrientationChangeListener(async () => {
          const now = await ScreenOrientation.getOrientationAsync();
          if (!resolved && isLandscape(now)) {
            resolved = true;
            clearTimeout(tid);
            ScreenOrientation.removeOrientationChangeListener(sub);
            resolve();
          }
        });
      });
    } catch {}
  }, []);

  const waitForPortrait = useCallback(async (timeoutMs?: number) => {
    if (Platform.OS === 'web') return;
    try {
      const effectiveTimeout = typeof timeoutMs === 'number' ? timeoutMs : PORTRAIT_ROTATION_TIMEOUT_MS;
      const isPortrait = (o: ScreenOrientation.Orientation | null) => (
        o === ScreenOrientation.Orientation.PORTRAIT_UP ||
        o === ScreenOrientation.Orientation.PORTRAIT_DOWN
      );
      const current = await ScreenOrientation.getOrientationAsync();
      if (isPortrait(current)) return;
      await new Promise<void>((resolve) => {
        let resolved = false;
        const tid = setTimeout(() => {
          if (!resolved) { resolved = true; resolve(); }
        }, effectiveTimeout);
        const sub = ScreenOrientation.addOrientationChangeListener(async () => {
          const now = await ScreenOrientation.getOrientationAsync();
          if (!resolved && isPortrait(now)) {
            resolved = true;
            clearTimeout(tid);
            ScreenOrientation.removeOrientationChangeListener(sub);
            resolve();
          }
        });
      });
    } catch {}
  }, []);

  // Não forçamos landscape; a UI permanece em retrato

  // Se o usuário girar o aparelho para horizontal na tela embutida, abre fullscreen automaticamente
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const handle = (event: ScreenOrientation.OrientationChangeEvent) => {
      try {
        const deviceOrientation = event?.orientationInfo?.orientation;
        const isLandscape = deviceOrientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT || deviceOrientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
        setIsLandscapeDevice(isLandscape);
        if (!showFullscreen && isLandscape) {
          // Pega o estado/tempo atual e abre fullscreen via onMessage -> 'current'
          sendJS('window.getState()');
        } else if (showFullscreen && !isLandscape) {
          // Em retrato, sincroniza FS->embed e fecha
          if (!pendingFsClose) {
            setPendingFsClose(true);
            fsWebviewRef.current?.injectJavaScript('window.ReactNativeWebView && window.getCurrent ? window.getCurrent() : (function(){var t=player?player.getCurrentTime():0; var s=player?player.getPlayerState():2; window.ReactNativeWebView.postMessage(JSON.stringify({type:\'fsCurrent\', data:{time:t,state:s}}));})(); true;');
          }
        }
      } catch {}
    };
    // Estado inicial
    ScreenOrientation.getOrientationAsync().then((o) => {
      const isLandscape = o === ScreenOrientation.Orientation.LANDSCAPE_LEFT || o === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      setIsLandscapeDevice(isLandscape);
    }).catch(() => {});
    const sub = ScreenOrientation.addOrientationChangeListener(handle);
    return () => {
      ScreenOrientation.removeOrientationChangeListener(sub);
    };
  }, [showFullscreen, sendJS, pendingFsClose]);

  const openFullscreenFromState = useCallback(async (timeSeconds: number, playerState: number) => {
    // playerState: 1=playing, 3=buffering
    const shouldAutoplay = playerState === 1 || playerState === 3;
    setFsStartAt(Math.max(0, Number.isFinite(timeSeconds) ? timeSeconds : 0));
    setFsAutoPlay(shouldAutoplay);
    setShowFullscreen(true);
  }, []);

  return (
    <PageContainer>
      <Stack.Screen options={{ orientation: 'portrait' }} />
      {/* App Bar */}
      <View style={styles.appBar} accessibilityRole="header">
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar" style={[styles.backBtn, { backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderColor: isDark ? colors['divider-dark'] : 'transparent' }]}>
          <ChevronLeft size={22} color={isDark ? colors['text-primary-dark'] : colors['brand-purple']} />
        </Pressable>
        <Text style={[styles.appTitle, { color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'] }]}>Reprodução</Text>
      </View>

      {/* Player YouTube */}
      <View style={styles.player} accessibilityLabel="Player de vídeo">
        <WebView
          key={embedMode}
          ref={webviewRef}
          source={{ html: html, baseUrl: 'https://www.youtube.com' }}
          allowsFullscreenVideo={false}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={["*"]}
          scrollEnabled={false}
          allowsLinkPreview={false}
          setSupportMultipleWindows={false}
            cacheEnabled
            cacheMode={Platform.OS === 'android' ? 'LOAD_DEFAULT' as any : undefined}
          onShouldStartLoadWithRequest={(req) => {
            // Permite o documento inicial e recursos dentro de iframes; bloqueia navegações externas
            if ((req as any).isTopFrame === false) return true;
            if (req.url === 'about:blank') return true;
            try {
              const { hostname } = new URL(req.url);
              const allowedHosts = [
                'www.youtube.com',
                'youtube.com',
                'm.youtube.com',
                'www.youtube-nocookie.com',
                's.ytimg.com'
              ];
              return allowedHosts.includes(hostname);
            } catch {
              return false;
            }
          }}
          onMessage={(e) => {
            try {
              const msg = JSON.parse(e.nativeEvent.data);
              if (msg?.type === 'state') {
                // 1 = playing, 2 = paused
                const playing = msg.data === 1;
                setIsPlaying(playing);
                setPlayerVisible(true);
              } else if (msg?.type === 'fsCurrent') {
                // Sincroniza estado do FS no embed e garante play visível
                const t = Number(msg?.data?.time) || 0;
                sendJS(`window.seekTo(${Math.floor(t)});`);
                sendJS('window.playVideo()');
                setIsPlaying(true);
                setPlayerVisible(true);
                if (pendingFsClose) {
                  setPendingFsClose(false);
                  setShowFullscreen(false);
                }
              } else if (msg?.type === 'ready') {
                // Exibe thumbnail/play sem mostrar telas de erro transitórias
                setPlayerVisible(true);
              } else if (msg?.type === 'error') {
                // Fallback simples: privacy -> standard
                setEmbedMode((prev) => (prev === 'privacy' ? 'standard' : prev));
              } else if (msg?.type === 'current') {
                const t = Number(msg?.data?.time) || 0;
                const st = Number(msg?.data?.state) || 2;
                openFullscreenFromState(t, st);
              }
            } catch {}
          }}
          style={{ flex: 1, borderRadius: 16, overflow: 'hidden', opacity: playerVisible ? 1 : 0 }}
        />
        {/* Overlay moderno com botão grande Play/Pause */}
        <Pressable
          onPress={() => sendJS('window.togglePlay()')}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
          style={styles.touchBlocker}
        >
          {!isPlaying && (
            <View style={styles.overlayScrim} pointerEvents="none" />
          )}
          <View style={styles.centerControls} pointerEvents="none">
            <View style={styles.bigCircle}>
              {isPlaying ? <Pause size={36} color={'#FFFFFF'} /> : <Play size={36} color={'#FFFFFF'} />}
            </View>
          </View>
        </Pressable>
        {!playerVisible && (
          <View style={styles.placeholder} pointerEvents="none">
            <Image
              source={{ uri: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` }}
              resizeMode="cover"
              style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
              blurRadius={1}
            />
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Infos */}
      <View style={{ marginTop: 12 }}>
        <Text style={{ color: isDark ? colors['text-primary-dark'] : colors['text-primary-light'], fontFamily: dsFontFamily['jakarta-extrabold'], fontSize: titleType.fontSize.default, lineHeight: titleType.lineHeight.default }}>Título do vídeo #{id}</Text>
        <Text style={{ marginTop: 8, color: isDark ? colors['text-secondary-dark'] : colors['text-secondary-light'], fontFamily: dsFontFamily['jakarta-medium'], fontSize: bodyType.fontSize.default, lineHeight: bodyType.lineHeight.default }}>Descrição breve do vídeo com instruções simples.</Text>
      </View>

      {/* Controles inferiores compactos: -15s, +15s, Expandir, Favoritar */}
      {!showFullscreen && !isLandscapeDevice && (
        <View style={styles.controlsCompactRow}>
          <Pressable
            style={[styles.smallControl, { backgroundColor: colors['brand-purple'] }]}
            accessibilityRole="button"
            accessibilityLabel="Voltar 15 segundos"
            onPress={() => sendJS('window.seekBy(-15)')}
          >
            <Text style={styles.smallControlText}>-15s</Text>
          </Pressable>
          <Pressable
            style={[styles.smallControl, { backgroundColor: colors['brand-purple'] }]}
            accessibilityRole="button"
            accessibilityLabel="Avançar 15 segundos"
            onPress={() => sendJS('window.seekBy(15)')}
          >
            <Text style={styles.smallControlText}>+15s</Text>
          </Pressable>
          <Pressable
            style={[
              styles.smallControl,
              { backgroundColor: isDark ? colors['bg-secondary-dark'] : '#FFFFFF', borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Tela cheia"
            onPress={() => sendJS('window.getState()')}
          >
            <Maximize2 size={20} color={isDark ? '#FFFFFF' : colors['brand-purple']} />
          </Pressable>
          <Pressable
            style={[
              styles.smallControl,
              { backgroundColor: isFavorite ? colors['brand-coral'] : (isDark ? colors['bg-secondary-dark'] : '#FFFFFF'), borderWidth: 1, borderColor: isDark ? colors['divider-dark'] : '#E5E7EB' },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            onPress={() => setIsFavorite((v) => !v)}
          >
            <Heart size={20} color={isFavorite ? '#FFFFFF' : (isDark ? '#FFFFFF' : colors['brand-purple'])} />
          </Pressable>
        </View>
      )}

      <Modal
        visible={showFullscreen}
        transparent={false}
        animationType="none"
        presentationStyle="fullScreen"
        supportedOrientations={["portrait"]}
        onRequestClose={() => setShowFullscreen(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width:  Math.max(1, (typeof screenHeight === 'number' ? screenHeight : 0)), height: Math.max(1, (typeof screenWidth === 'number' ? screenWidth : 0)), transform: [{ rotate: '90deg' }], backgroundColor: '#000' }}>
          <WebView
            ref={fsWebviewRef}
            source={{ html: `<!DOCTYPE html>
<html>
  <head>
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1\" />
    <link rel=\"preconnect\" href=\"https://www.youtube.com\" />
    <link rel=\"preconnect\" href=\"https://i.ytimg.com\" />
    <link rel=\"preconnect\" href=\"https://s.ytimg.com\" />
    <link rel=\"dns-prefetch\" href=\"https://www.youtube.com\" />
    <link rel=\"dns-prefetch\" href=\"https://i.ytimg.com\" />
    <link rel=\"dns-prefetch\" href=\"https://s.ytimg.com\" />
    <link rel=\"preload\" as=\"script\" href=\"https://www.youtube.com/iframe_api\" />
    <style>html,body,#player{height:100%;margin:0;background:#000;overflow:hidden}</style>
  </head>
  <body>
    <div id=\"player\"></div>
    <script>
      var tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';
      tag.async = true;
      var fst=document.getElementsByTagName('script')[0];fst.parentNode.insertBefore(tag,fst);
      var player;function post(msg){ if(window.ReactNativeWebView){ window.ReactNativeWebView.postMessage(JSON.stringify(msg)); } }
      function onYouTubeIframeAPIReady(){
        player=new YT.Player('player',{
          height:'100%',width:'100%',videoId:'${videoId}',
          playerVars:{
            playsinline:1,
                controls:0,
            rel:0,
            modestbranding:1,
            fs:0,
            disablekb:1,
            iv_load_policy:3,
            start:${Math.floor(fsStartAt)}
          },
          host: '${embedMode === 'privacy' ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com'}',
          events:{
            'onReady':function(){ try { player.unMute(); } catch(e) {} ${fsAutoPlay ? 'player.playVideo();' : ''} },
            'onStateChange': function(e){ post({ type: 'state', data: e.data }); },
            'onError': function(e){ post({ type: 'error', data: e.data }); }
          }
        });
      }
      window.playVideo = function(){ if(player){ player.playVideo(); } };
      window.pauseVideo = function(){ if(player){ player.pauseVideo(); } };
      window.togglePlay = function(){ if(!player) return; var s = player.getPlayerState(); if(s===1){ player.pauseVideo(); } else { player.playVideo(); } };
      window.seekBy = function(sec){ if(!player) return; var t = player.getCurrentTime(); player.seekTo(t + sec, true); };
      window.getCurrent = function(){ try { var t = player ? player.getCurrentTime() : 0; var s = player ? player.getPlayerState() : 2; post({ type: 'fsCurrent', data: { time: t, state: s } }); } catch(e){ post({ type: 'fsCurrent', data: { time: 0, state: 2 } }); } };
    </script>
  </body>
</html>`, baseUrl: 'https://www.youtube.com' }}
            allowsFullscreenVideo={false}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={["*"]}
            scrollEnabled={false}
            allowsLinkPreview={false}
            setSupportMultipleWindows={false}
            cacheEnabled
            cacheMode={Platform.OS === 'android' ? 'LOAD_DEFAULT' as any : undefined}
            onShouldStartLoadWithRequest={(req) => {
              if ((req as any).isTopFrame === false) return true;
              if (req.url === 'about:blank') return true;
              try {
                const { hostname } = new URL(req.url);
                const allowedHosts = [
                  'www.youtube.com',
                  'youtube.com',
                  'm.youtube.com',
                  'www.youtube-nocookie.com',
                  's.ytimg.com'
                ];
                return allowedHosts.includes(hostname);
              } catch {
                return false;
              }
            }}
            onMessage={(e) => {
              try {
                const msg = JSON.parse(e.nativeEvent.data);
                if (msg?.type === 'state') {
                  setIsPlaying(msg.data === 1);
                } else if (msg?.type === 'error') {
                  setEmbedMode((prev) => (prev === 'privacy' ? 'standard' : prev));
                }
              } catch {}
            }}
            style={{ flex: 1, opacity: 1 }}
          />
          </View>
          {/* Bloqueia interações dentro do player em tela cheia */}
          <Pressable
            onPress={() => sendFsJS('window.togglePlay()')}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
            style={styles.fullscreenTouchBlocker}
          />
          {/* Sem botões de controle customizados em horizontal */}
          <Pressable
            onPress={() => setShowFullscreen(false)}
            style={styles.fullscreenClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar tela cheia"
          >
            <X size={26} color="#FFFFFF" />
          </Pressable>
        </View>
      </Modal>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  appBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2, paddingBottom: 8, marginBottom: 6 },
  backBtn: { height: 44, paddingHorizontal: 10, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  appTitle: { fontFamily: dsFontFamily['jakarta-medium'], fontSize: 16 },
  player: { height: 220, borderRadius: 16, overflow: 'hidden' },
  controlsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  control: { flex: 1, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors['brand-purple'] },
  fullscreenClose: { position: 'absolute', top: 28, right: 16, width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  fullscreenControlsRow: { position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', gap: 10 },
  touchBlocker: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  centerControls: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  bigCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(67,5,147,0.95)', alignItems: 'center', justifyContent: 'center' },
  overlayScrim: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)' },
  fullscreenTouchBlocker: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  placeholder: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  controlsCompactRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  smallControl: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  smallControlText: { color: '#FFFFFF', fontFamily: dsFontFamily['jakarta-bold'] },
});


