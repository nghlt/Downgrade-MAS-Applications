/**
 * This Frida script disables SSL pinning and verification on any target macOS Catalina process.
 * https://gist.github.com/azenla/37f941de24c5dfe46f3b8e93d94ce909
 * (c) azenla, 2019
 * Used for this repo: https://github.com/trungnghiatn/Downgrade-MAS-Applications
 */

var SecurityModule = Process.getModuleByName('Security');
var libboringsslModule = Process.getModuleByName('libboringssl.dylib');

var SecTrustEvaluate_handle =
    SecurityModule.getExportByName('SecTrustEvaluate');
var SecTrustEvaluateWithError_handle =
    SecurityModule.getExportByName('SecTrustEvaluateWithError');
var SSL_CTX_set_custom_verify_handle =
    libboringsslModule.getExportByName('SSL_CTX_set_custom_verify');
var SSL_get_psk_identity_handle =
    libboringsslModule.getExportByName('SSL_get_psk_identity');
var boringssl_context_set_verify_mode_handle = 
    libboringsslModule.getExportByName('boringssl_context_set_verify_mode');

if (SecTrustEvaluateWithError_handle) {
  var SecTrustEvaluateWithError = new NativeFunction(
      SecTrustEvaluateWithError_handle, 'int', ['pointer', 'pointer']);

  Interceptor.replace(
      SecTrustEvaluateWithError_handle,
      new NativeCallback(function(trust, error) {
        console.log('[*] Called SecTrustEvaluateWithError()');
        SecTrustEvaluateWithError(trust, NULL);
        Memory.writeU8(error, 0);
        return 1;
      }, 'int', ['pointer', 'pointer']));
  console.log('[+] SecTrustEvaluateWithError() hook installed.');
}

if (SecTrustEvaluate_handle) {
  var SecTrustEvaluate = new NativeFunction(
      SecTrustEvaluate_handle, 'int', ['pointer', 'pointer']);

  Interceptor.replace(
      SecTrustEvaluate_handle, new NativeCallback(function(trust, result) {
        console.log('[*] Called SecTrustEvaluate()');
        SecTrustEvaluate(trust, result);
        Memory.writeU8(result, 1);
        return 0;
      }, 'int', ['pointer', 'pointer']));
  console.log('[+] SecTrustEvaluate() hook installed.');
}

if (SSL_CTX_set_custom_verify_handle) {
  var SSL_CTX_set_custom_verify = new NativeFunction(
      SSL_CTX_set_custom_verify_handle, 'void', ['pointer', 'int', 'pointer']);

  var replaced_callback = new NativeCallback(function(ssl, out) {
    console.log('[*] Called custom SSL verifier')
    return 0;
  }, 'int', ['pointer', 'pointer']);

  Interceptor.replace(
      SSL_CTX_set_custom_verify_handle,
      new NativeCallback(function(ctx, mode, callback) {
        console.log('[*] Called SSL_CTX_set_custom_verify()');
        SSL_CTX_set_custom_verify(ctx, 0, replaced_callback);
      }, 'int', ['pointer', 'int', 'pointer']));
  console.log('[+] SSL_CTX_set_custom_verify() hook installed.')
}

if (SSL_get_psk_identity_handle) {
  Interceptor.replace(
      SSL_get_psk_identity_handle, new NativeCallback(function(ssl) {
        console.log('[*] Called SSL_get_psk_identity_handle()');
        return 'notarealPSKidentity';
      }, 'pointer', ['pointer']));
  console.log('[+] SSL_get_psk_identity() hook installed.')
}

if (boringssl_context_set_verify_mode_handle) {
  var boringssl_context_set_verify_mode = new NativeFunction(
      boringssl_context_set_verify_mode_handle, 'int', ['pointer', 'pointer']);

  Interceptor.replace(
      boringssl_context_set_verify_mode_handle,
      new NativeCallback(function(a, b) {
        console.log('[*] Called boringssl_context_set_verify_mode()');
        return 0;
      }, 'int', ['pointer', 'pointer']));
  console.log('[+] boringssl_context_set_verify_mode() hook installed.')
}
