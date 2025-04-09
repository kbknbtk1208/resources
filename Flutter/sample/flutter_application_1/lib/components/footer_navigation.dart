import 'package:flutter/material.dart';

class FooterNavigation extends StatefulWidget {
  final int selectedIndex;
  final Function(int) function;
  const FooterNavigation(this.selectedIndex, this.function, {super.key});

  @override
  State<FooterNavigation> createState() => _FooterNavigationState();
}

class _FooterNavigationState extends State<FooterNavigation> {
  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: widget.selectedIndex,
        onTap: widget.function,
        items: [
          BottomNavigationBarItem(icon: Icon(Icons.photo), label: 'Insta'),
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'chat')
        ]);
  }
}
