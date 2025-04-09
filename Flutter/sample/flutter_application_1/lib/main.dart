import 'package:flutter/material.dart';
import 'package:flutter_application_1/components/footer_navigation.dart';
import 'package:flutter_application_1/components/instagram.dart';
import 'package:flutter_application_1/components/sample.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demoa',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int selectIndex = 0;

  @override
  Widget build(BuildContext context) {
    //

    final List<Widget> rootWidgetIcons = [
      Instagram(),
      const Sample('bbbbb'),
    ];

    void _onItemTapped(int index) {
      setState(() {
        selectIndex = index;
      });
    }

    return MaterialApp(
        home: Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.error,
        title: const Text('aisaaaaaaafffueo'),
      ),
      body: rootWidgetIcons[selectIndex],
      bottomNavigationBar: FooterNavigation(selectIndex, _onItemTapped),
    ));
  }
}
