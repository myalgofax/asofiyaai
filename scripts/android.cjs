const { existsSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const env = { ...process.env };
env.NODE_ENV ||= 'development';
const windows = process.platform === 'win32';
const javaName = windows ? 'java.exe' : 'java';
function compatibleJava(home) {
  const result = spawnSync(home ? path.join(home, 'bin', javaName) : javaName, ['-version'], { encoding: 'utf8' });
  const version = `${result.stderr || ''}${result.stdout || ''}`.match(/version "(\d+)/);
  return result.status === 0 && version && [17, 21].includes(Number(version[1]));
}
if (!compatibleJava(env.JAVA_HOME)) {
  const studioJava = windows ? path.join(env.ProgramFiles || 'C:\\Program Files', 'Android', 'Android Studio', 'jbr') : '/Applications/Android Studio.app/Contents/jbr/Contents/Home';
  if (!compatibleJava(studioJava)) {
    console.error('Android builds require JDK 17 or 21. Set JAVA_HOME to a compatible JDK or install Android Studio.');
    process.exit(1);
  }
  env.JAVA_HOME = studioJava;
  console.log('Using Android Studio’s Java runtime for this build.');
}
if (!env.ANDROID_HOME && !env.ANDROID_SDK_ROOT && windows && env.LOCALAPPDATA) {
  const sdk = path.join(env.LOCALAPPDATA, 'Android', 'Sdk');
  if (existsSync(sdk)) env.ANDROID_HOME = sdk;
}
const apk = process.argv.includes('--apk');
const release = process.argv.includes('--release');
const gradleTask = release ? ':app:assembleRelease' : ':app:assembleDebug';
const gradleBat = release ? 'gradlew.bat :app:assembleRelease --no-daemon' : 'gradlew.bat :app:assembleDebug --no-daemon';
const result = (apk || release)
  ? spawnSync(windows ? 'cmd.exe' : './gradlew', windows ? ['/d', '/c', gradleBat] : [gradleTask, '--no-daemon'], { cwd: path.join(root, 'android'), env, stdio: 'inherit' })
  : spawnSync(process.execPath, [require.resolve('expo/bin/cli'), 'run:android', ...process.argv.slice(2)], { cwd: root, env, stdio: 'inherit' });
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
