import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// ----- SERVER CONFIGURATION -----
// Uncomment the ONLY ONE backend URL you want to connect to:

// 1. AWS Cloud Deployed Backend (Production)
// const String kBaseUrl = 'http://13.60.230.32:8080/api';

// 2. Render Cloud Deployed Backend (Production)
const String kBaseUrl = 'https://api-gateway-byj6.onrender.com/api';

// 3. Android Emulator (Local Docker Backend)
// const String kBaseUrl = 'http://10.0.2.2:8080/api';

// 4. Physical Device on Wi-Fi (Local Docker Backend)
//    - This MUST be your computer's current local IPv4 address.
// const String kBaseUrl = 'http://192.168.8.185:8080/api';

class ApiClient {
  late Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: kBaseUrl, // Now natively uses the constant from above
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'jwt_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            // Handle unauthorized globally (e.g., clear token, logout user)
            await _storage.delete(key: 'jwt_token');
          }
          return handler.next(e);
        },
      ),
    );
  }

  Dio get dio => _dio;
}
