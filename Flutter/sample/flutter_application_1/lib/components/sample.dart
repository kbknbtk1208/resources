import 'package:flutter/material.dart';

class Sample extends StatelessWidget {
  final String text;
  const Sample(this.text, {Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text(this.text),
    );
  }
}
