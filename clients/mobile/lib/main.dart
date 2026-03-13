import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const DECApp());
}

class DECApp extends StatelessWidget {
  const DECApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DECP Mobile',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const HomePage(title: 'DECP Mobile Client'),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.title});
  final String title;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String status = "Not tested";

  // Simulate connecting to the same unified API Gateway
  Future<void> _testGateway() async {
    try {
      // Address must be IP when testing in emulator instead of 'localhost'
      final url = Uri.parse('http://10.0.2.2:8080/health');
      final response = await http.get(url);
      
      if (response.statusCode == 200) {
        setState(() { status = "Gateway Connected Successfully!"; });
      } else {
        setState(() { status = "Gateway returned error: ${response.statusCode}"; });
      }
    } catch (e) {
      setState(() { status = "Connection Failed. Is Gateway up?"; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
             const Text(
              'Mobile Architecture Demo',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Text(
                'This Flutter client consumes the SAME backend API Gateway endpoints as the React web app. Stateless JWT auth makes this seamless.',
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 20),
            Text('API Status: $status', style: const TextStyle(color: Colors.blue)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _testGateway,
              child: const Text('Test API Gateway'),
            )
          ],
        ),
      ),
    );
  }
}
