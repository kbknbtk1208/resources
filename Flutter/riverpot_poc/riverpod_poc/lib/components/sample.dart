import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'sample.g.dart';

@riverpod
String my(MyRef ref) {
  return 'a';
}
