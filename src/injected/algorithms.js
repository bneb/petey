export var algorithms = {
  'Two Sum': [
    '// Given an array of integers nums and an integer target,',
    '// return indices of the two numbers such that they add up to target.',
    '',
    'function twoSum(nums, target) {',
    '  var map = {};',
    '  for (var i = 0; i < nums.length; i++) {',
    '    var complement = target - nums[i];',
    '    if (map[complement] !== undefined) {',
    '      return [map[complement], i];',
    '    }',
    '    map[nums[i]] = i;',
    '  }',
    '  return [];',
    '}',
    '',
    'var nums = [2, 7, 11, 15];',
    'var target = 9;',
    'console.log("Input:", nums, "Target:", target);',
    'console.log("Result:", twoSum(nums, target));',
  ].join('\n'),
  
  'Fibonacci': [
    '// Calculate the nth Fibonacci number',
    '',
    'function fibonacci(n) {',
    '  if (n <= 1) return n;',
    '  var a = 0, b = 1;',
    '  for (var i = 2; i <= n; i++) {',
    '    var temp = a + b;',
    '    a = b;',
    '    b = temp;',
    '  }',
    '  return b;',
    '}',
    '',
    'console.log("Fibonacci(10) =", fibonacci(10));',
  ].join('\n'),
  
  'Reverse String': [
    '// Reverse a string in-place',
    '',
    'function reverseString(str) {',
    '  var arr = str.split("");',
    '  var left = 0;',
    '  var right = arr.length - 1;',
    '  while (left < right) {',
    '    var temp = arr[left];',
    '    arr[left] = arr[right];',
    '    arr[right] = temp;',
    '    left++;',
    '    right--;',
    '  }',
    '  return arr.join("");',
    '}',
    '',
    'console.log(reverseString("hello world!"));',
  ].join('\n')
};

export function getAlgorithmsCode() {
  var code = 'var _algorithms = {};\n';
  for (var key in algorithms) {
    if (algorithms.hasOwnProperty(key)) {
      code += '_algorithms["' + key + '"] = decodeURIComponent("' + encodeURIComponent(algorithms[key]) + '");\n';
    }
  }
  return code;
}
