from flask import Flask, render_template, request, jsonify
import subprocess
import json
import time
import sys
from io import StringIO
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Data Structures and Algorithms content
DSA_CONTENT = {
    'data_structures': [
        {
            'id': 'arrays',
            'title': 'Arrays',
            'description': 'Learn about arrays - contiguous memory locations storing elements of the same type.',
            'content': '''
<h2>Arrays</h2>
<p>An array is a collection of elements stored in contiguous memory locations. Each element can be accessed using its index.</p>

<h3>Key Properties:</h3>
<ul>
    <li>Fixed size (in most languages)</li>
    <li>Random access in O(1) time</li>
    <li>Sequential memory allocation</li>
    <li>Same data type for all elements</li>
</ul>

<h3>Common Operations:</h3>
<ul>
    <li><strong>Access:</strong> O(1) - Direct index access</li>
    <li><strong>Search:</strong> O(n) - Linear search, O(log n) if sorted</li>
    <li><strong>Insertion:</strong> O(n) - May require shifting elements</li>
    <li><strong>Deletion:</strong> O(n) - May require shifting elements</li>
</ul>

<h3>Python Example:</h3>
<pre><code>
# Creating an array (list in Python)
arr = [1, 2, 3, 4, 5]

# Accessing elements
print(arr[0])  # Output: 1

# Modifying elements
arr[2] = 10

# Iterating through array
for element in arr:
    print(element)
</code></pre>
            '''
        },
        {
            'id': 'linked_lists',
            'title': 'Linked Lists',
            'description': 'Understand linked lists - dynamic data structures with nodes connected by pointers.',
            'content': '''
<h2>Linked Lists</h2>
<p>A linked list is a linear data structure where elements are not stored in contiguous memory. Each element (node) contains data and a reference to the next node.</p>

<h3>Types:</h3>
<ul>
    <li><strong>Singly Linked List:</strong> Each node points to the next node</li>
    <li><strong>Doubly Linked List:</strong> Each node points to both next and previous nodes</li>
    <li><strong>Circular Linked List:</strong> Last node points back to the first node</li>
</ul>

<h3>Common Operations:</h3>
<ul>
    <li><strong>Access:</strong> O(n) - Must traverse from head</li>
    <li><strong>Search:</strong> O(n) - Linear traversal required</li>
    <li><strong>Insertion:</strong> O(1) - At head or known position</li>
    <li><strong>Deletion:</strong> O(1) - At head or known position</li>
</ul>

<h3>Python Example:</h3>
<pre><code>
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def insert_at_beginning(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
    
    def print_list(self):
        current = self.head
        while current:
            print(current.data, end=" -> ")
            current = current.next
        print("None")

# Usage
ll = LinkedList()
ll.insert_at_beginning(3)
ll.insert_at_beginning(2)
ll.insert_at_beginning(1)
ll.print_list()  # Output: 1 -> 2 -> 3 -> None
</code></pre>
            '''
        },
        {
            'id': 'stacks',
            'title': 'Stacks',
            'description': 'Learn about stacks - LIFO (Last In First Out) data structure.',
            'content': '''
<h2>Stacks</h2>
<p>A stack is a linear data structure that follows the LIFO (Last In First Out) principle. The last element added is the first one to be removed.</p>

<h3>Key Operations:</h3>
<ul>
    <li><strong>Push:</strong> O(1) - Add element to top</li>
    <li><strong>Pop:</strong> O(1) - Remove element from top</li>
    <li><strong>Peek/Top:</strong> O(1) - View top element without removing</li>
    <li><strong>isEmpty:</strong> O(1) - Check if stack is empty</li>
</ul>

<h3>Applications:</h3>
<ul>
    <li>Function call stack</li>
    <li>Expression evaluation</li>
    <li>Undo mechanisms</li>
    <li>Browser history</li>
</ul>

<h3>Python Example:</h3>
<pre><code>
class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        return None
    
    def peek(self):
        if not self.is_empty():
            return self.items[-1]
        return None
    
    def is_empty(self):
        return len(self.items) == 0

# Usage
stack = Stack()
stack.push(1)
stack.push(2)
stack.push(3)
print(stack.pop())  # Output: 3
print(stack.peek())  # Output: 2
</code></pre>
            '''
        },
        {
            'id': 'queues',
            'title': 'Queues',
            'description': 'Understand queues - FIFO (First In First Out) data structure.',
            'content': '''
<h2>Queues</h2>
<p>A queue is a linear data structure that follows the FIFO (First In First Out) principle. The first element added is the first one to be removed.</p>

<h3>Key Operations:</h3>
<ul>
    <li><strong>Enqueue:</strong> O(1) - Add element to rear</li>
    <li><strong>Dequeue:</strong> O(1) - Remove element from front</li>
    <li><strong>Front:</strong> O(1) - View front element</li>
    <li><strong>isEmpty:</strong> O(1) - Check if queue is empty</li>
</ul>

<h3>Types:</h3>
<ul>
    <li><strong>Simple Queue:</strong> Basic FIFO queue</li>
    <li><strong>Circular Queue:</strong> Last position connects to first</li>
    <li><strong>Priority Queue:</strong> Elements have priorities</li>
    <li><strong>Deque:</strong> Double-ended queue</li>
</ul>

<h3>Python Example:</h3>
<pre><code>
from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()
    
    def enqueue(self, item):
        self.items.append(item)
    
    def dequeue(self):
        if not self.is_empty():
            return self.items.popleft()
        return None
    
    def front(self):
        if not self.is_empty():
            return self.items[0]
        return None
    
    def is_empty(self):
        return len(self.items) == 0

# Usage
queue = Queue()
queue.enqueue(1)
queue.enqueue(2)
queue.enqueue(3)
print(queue.dequeue())  # Output: 1
print(queue.front())  # Output: 2
</code></pre>
            '''
        },
        {
            'id': 'trees',
            'title': 'Trees',
            'description': 'Master tree structures - hierarchical data structures with nodes connected by edges.',
            'content': '''
<h2>Trees</h2>
<p>A tree is a hierarchical data structure consisting of nodes connected by edges. Each tree has a root node and zero or more child nodes.</p>

<h3>Key Terminology:</h3>
<ul>
    <li><strong>Root:</strong> Topmost node in a tree</li>
    <li><strong>Parent:</strong> Node with child nodes</li>
    <li><strong>Child:</strong> Node descended from another node</li>
    <li><strong>Leaf:</strong> Node with no children</li>
    <li><strong>Height:</strong> Length of longest path from root to leaf</li>
    <li><strong>Depth:</strong> Length of path from root to a node</li>
</ul>

<h3>Types:</h3>
<ul>
    <li><strong>Binary Tree:</strong> Each node has at most 2 children</li>
    <li><strong>Binary Search Tree (BST):</strong> Left < Parent < Right</li>
    <li><strong>AVL Tree:</strong> Self-balancing BST</li>
    <li><strong>Heap:</strong> Complete binary tree with heap property</li>
</ul>

<h3>Python Example (Binary Tree):</h3>
<pre><code>
class TreeNode:
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None

class BinaryTree:
    def __init__(self):
        self.root = None
    
    def inorder_traversal(self, node):
        if node:
            self.inorder_traversal(node.left)
            print(node.data, end=" ")
            self.inorder_traversal(node.right)

# Usage
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
root.left.right = TreeNode(5)

tree = BinaryTree()
tree.root = root
tree.inorder_traversal(root)  # Output: 4 2 5 1 3
</code></pre>
            '''
        }
    ],
    'algorithms': [
        {
            'id': 'sorting',
            'title': 'Sorting Algorithms',
            'description': 'Learn various sorting techniques from basic to advanced.',
            'content': '''
<h2>Sorting Algorithms</h2>
<p>Sorting algorithms arrange elements in a specific order (ascending or descending).</p>

<h3>Common Sorting Algorithms:</h3>

<h4>1. Bubble Sort - O(n²)</h4>
<p>Repeatedly swaps adjacent elements if they are in wrong order.</p>
<pre><code>
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

print(bubble_sort([64, 34, 25, 12, 22]))
</code></pre>

<h4>2. Selection Sort - O(n²)</h4>
<p>Selects the minimum element and places it at the beginning.</p>
<pre><code>
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i+1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
</code></pre>

<h4>3. Merge Sort - O(n log n)</h4>
<p>Divide and conquer algorithm that divides array into halves.</p>
<pre><code>
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result
</code></pre>

<h4>4. Quick Sort - O(n log n) average</h4>
<p>Picks a pivot and partitions array around it.</p>
<pre><code>
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)
</code></pre>
            '''
        },
        {
            'id': 'searching',
            'title': 'Searching Algorithms',
            'description': 'Master searching techniques for finding elements efficiently.',
            'content': '''
<h2>Searching Algorithms</h2>
<p>Searching algorithms find the position of a target element in a data structure.</p>

<h3>1. Linear Search - O(n)</h3>
<p>Check each element sequentially until target is found.</p>
<pre><code>
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

arr = [10, 20, 30, 40, 50]
print(linear_search(arr, 30))  # Output: 2
</code></pre>

<h3>2. Binary Search - O(log n)</h3>
<p>Efficient search on sorted arrays by dividing search space in half.</p>
<pre><code>
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

arr = [10, 20, 30, 40, 50]
print(binary_search(arr, 30))  # Output: 2
</code></pre>

<h3>3. Binary Search (Recursive)</h3>
<pre><code>
def binary_search_recursive(arr, target, left, right):
    if left > right:
        return -1
    
    mid = (left + right) // 2
    
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    else:
        return binary_search_recursive(arr, target, left, mid - 1)

arr = [10, 20, 30, 40, 50]
print(binary_search_recursive(arr, 30, 0, len(arr) - 1))
</code></pre>
            '''
        },
        {
            'id': 'recursion',
            'title': 'Recursion',
            'description': 'Understand recursive problem-solving techniques.',
            'content': '''
<h2>Recursion</h2>
<p>Recursion is a technique where a function calls itself to solve smaller instances of the same problem.</p>

<h3>Key Components:</h3>
<ul>
    <li><strong>Base Case:</strong> Condition to stop recursion</li>
    <li><strong>Recursive Case:</strong> Function calls itself with modified parameters</li>
</ul>

<h3>Example 1: Factorial</h3>
<pre><code>
def factorial(n):
    # Base case
    if n == 0 or n == 1:
        return 1
    # Recursive case
    return n * factorial(n - 1)

print(factorial(5))  # Output: 120
</code></pre>

<h3>Example 2: Fibonacci</h3>
<pre><code>
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(6))  # Output: 8
</code></pre>

<h3>Example 3: Tower of Hanoi</h3>
<pre><code>
def tower_of_hanoi(n, source, auxiliary, destination):
    if n == 1:
        print(f"Move disk 1 from {source} to {destination}")
        return
    
    tower_of_hanoi(n - 1, source, destination, auxiliary)
    print(f"Move disk {n} from {source} to {destination}")
    tower_of_hanoi(n - 1, auxiliary, source, destination)

tower_of_hanoi(3, 'A', 'B', 'C')
</code></pre>

<h3>Example 4: Binary Search (Recursive)</h3>
<pre><code>
def binary_search(arr, target, left, right):
    if left > right:
        return -1
    
    mid = (left + right) // 2
    
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search(arr, target, mid + 1, right)
    else:
        return binary_search(arr, target, left, mid - 1)
</code></pre>
            '''
        },
        {
            'id': 'dynamic_programming',
            'title': 'Dynamic Programming',
            'description': 'Learn optimization techniques using dynamic programming.',
            'content': '''
<h2>Dynamic Programming (DP)</h2>
<p>Dynamic Programming is an optimization technique that solves complex problems by breaking them down into simpler subproblems and storing their solutions.</p>

<h3>Key Concepts:</h3>
<ul>
    <li><strong>Optimal Substructure:</strong> Solution can be constructed from optimal solutions of subproblems</li>
    <li><strong>Overlapping Subproblems:</strong> Same subproblems are solved multiple times</li>
    <li><strong>Memoization:</strong> Top-down approach with caching</li>
    <li><strong>Tabulation:</strong> Bottom-up approach with table</li>
</ul>

<h3>Example 1: Fibonacci with Memoization</h3>
<pre><code>
def fibonacci_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    
    memo[n] = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    return memo[n]

print(fibonacci_memo(50))
</code></pre>

<h3>Example 2: Fibonacci with Tabulation</h3>
<pre><code>
def fibonacci_tab(n):
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    
    return dp[n]

print(fibonacci_tab(50))
</code></pre>

<h3>Example 3: Longest Common Subsequence</h3>
<pre><code>
def lcs(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    
    return dp[m][n]

print(lcs("abcde", "ace"))  # Output: 3
</code></pre>

<h3>Example 4: 0/1 Knapsack Problem</h3>
<pre><code>
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(
                    values[i - 1] + dp[i - 1][w - weights[i - 1]],
                    dp[i - 1][w]
                )
            else:
                dp[i][w] = dp[i - 1][w]
    
    return dp[n][capacity]

weights = [1, 2, 3, 4]
values = [10, 20, 30, 40]
capacity = 5
print(knapsack(weights, values, capacity))
</code></pre>
            '''
        }
    ]
}

# Practice problems with test cases
PROBLEMS = [
    {
        'id': 'two_sum',
        'title': 'Two Sum',
        'difficulty': 'Easy',
        'description': '''Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].''',
        'starter_code': '''def two_sum(nums, target):
    # Write your code here
    pass

# Test your solution
print(two_sum([2, 7, 11, 15], 9))''',
        'test_cases': [
            {'input': '[[2, 7, 11, 15], 9]', 'expected': '[0, 1]'},
            {'input': '[[3, 2, 4], 6]', 'expected': '[1, 2]'},
            {'input': '[[3, 3], 6]', 'expected': '[0, 1]'}
        ]
    },
    {
        'id': 'reverse_string',
        'title': 'Reverse String',
        'difficulty': 'Easy',
        'description': '''Write a function that reverses a string. The input string is given as an array of characters.

You must do this by modifying the input array in-place with O(1) extra memory.

Example:
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]''',
        'starter_code': '''def reverse_string(s):
    # Write your code here
    pass

# Test your solution
s = ["h", "e", "l", "l", "o"]
reverse_string(s)
print(s)''',
        'test_cases': [
            {'input': '[["h", "e", "l", "l", "o"]]', 'expected': '["o", "l", "l", "e", "h"]'},
            {'input': '[["H", "a", "n", "n", "a", "h"]]', 'expected': '["h", "a", "n", "n", "a", "H"]'}
        ]
    },
    {
        'id': 'valid_parentheses',
        'title': 'Valid Parentheses',
        'difficulty': 'Easy',
        'description': '''Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

Example:
Input: s = "()"
Output: True

Input: s = "()[]{}"
Output: True

Input: s = "(]"
Output: False''',
        'starter_code': '''def is_valid(s):
    # Write your code here
    pass

# Test your solution
print(is_valid("()"))
print(is_valid("()[]{}"))
print(is_valid("(]"))''',
        'test_cases': [
            {'input': '["()"]', 'expected': 'True'},
            {'input': '["()[]{}"]', 'expected': 'True'},
            {'input': '["(]"]', 'expected': 'False'},
            {'input': '["([)]"]', 'expected': 'False'}
        ]
    },
    {
        'id': 'binary_search',
        'title': 'Binary Search',
        'difficulty': 'Easy',
        'description': '''Given a sorted array of integers nums and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.

Example:
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
Explanation: 9 exists in nums and its index is 4''',
        'starter_code': '''def binary_search(nums, target):
    # Write your code here
    pass

# Test your solution
print(binary_search([-1, 0, 3, 5, 9, 12], 9))''',
        'test_cases': [
            {'input': '[[-1, 0, 3, 5, 9, 12], 9]', 'expected': '4'},
            {'input': '[[-1, 0, 3, 5, 9, 12], 2]', 'expected': '-1'},
            {'input': '[[5], 5]', 'expected': '0'}
        ]
    },
    {
        'id': 'merge_sorted_arrays',
        'title': 'Merge Two Sorted Arrays',
        'difficulty': 'Medium',
        'description': '''Given two sorted arrays, merge them into a single sorted array.

Example:
Input: arr1 = [1, 3, 5, 7], arr2 = [2, 4, 6, 8]
Output: [1, 2, 3, 4, 5, 6, 7, 8]''',
        'starter_code': '''def merge_sorted_arrays(arr1, arr2):
    # Write your code here
    pass

# Test your solution
print(merge_sorted_arrays([1, 3, 5, 7], [2, 4, 6, 8]))''',
        'test_cases': [
            {'input': '[[1, 3, 5, 7], [2, 4, 6, 8]]', 'expected': '[1, 2, 3, 4, 5, 6, 7, 8]'},
            {'input': '[[1, 2, 3], [4, 5, 6]]', 'expected': '[1, 2, 3, 4, 5, 6]'},
            {'input': '[[], [1, 2, 3]]', 'expected': '[1, 2, 3]'}
        ]
    }
]


@app.route('/')
def home():
    """Home page with overview"""
    return render_template('home.html', 
                         data_structures=DSA_CONTENT['data_structures'],
                         algorithms=DSA_CONTENT['algorithms'])


@app.route('/learn/<category>/<topic_id>')
def learn_topic(category, topic_id):
    """Display learning content for a specific topic"""
    topics = DSA_CONTENT.get(category, [])
    topic = next((t for t in topics if t['id'] == topic_id), None)
    
    if not topic:
        return "Topic not found", 404
    
    return render_template('topic.html', topic=topic, category=category)


@app.route('/problems')
def problems_list():
    """List all practice problems"""
    return render_template('problems.html', problems=PROBLEMS)


@app.route('/problem/<problem_id>')
def problem_detail(problem_id):
    """Display a specific problem"""
    problem = next((p for p in PROBLEMS if p['id'] == problem_id), None)
    
    if not problem:
        return "Problem not found", 404
    
    return render_template('problem_detail.html', problem=problem)


@app.route('/submit', methods=['POST'])
def submit_code():
    """Submit and execute code"""
    try:
        data = request.get_json()
        code = data.get('code', '')
        problem_id = data.get('problem_id', '')
        
        if not code:
            return jsonify({'error': 'No code provided'}), 400
        
        if len(code) > app.config['MAX_CODE_LENGTH']:
            return jsonify({'error': 'Code too long'}), 400
        
        # Find the problem
        problem = next((p for p in PROBLEMS if p['id'] == problem_id), None)
        if not problem:
            return jsonify({'error': 'Problem not found'}), 404
        
        # Execute code and run test cases
        results = []
        all_passed = True
        
        for i, test_case in enumerate(problem['test_cases']):
            try:
                # Prepare test code
                test_code = code + f"\n\n# Test case {i+1}\n"
                test_code += f"result = str(eval('{problem['id']}' + '{test_case['input']}'))\n"
                test_code += "print(result)"
                
                # Execute with timeout
                start_time = time.time()
                result = subprocess.run(
                    [sys.executable, '-c', test_code],
                    capture_output=True,
                    text=True,
                    timeout=app.config['CODE_TIMEOUT']
                )
                execution_time = time.time() - start_time
                
                output = result.stdout.strip()
                expected = test_case['expected']
                
                # Compare results (normalize strings for comparison)
                passed = output.replace(' ', '').replace("'", '"') == expected.replace(' ', '').replace("'", '"')
                
                if not passed:
                    all_passed = False
                
                results.append({
                    'test_case': i + 1,
                    'input': test_case['input'],
                    'expected': expected,
                    'output': output,
                    'passed': passed,
                    'execution_time': f"{execution_time:.3f}s",
                    'error': result.stderr if result.stderr else None
                })
                
            except subprocess.TimeoutExpired:
                all_passed = False
                results.append({
                    'test_case': i + 1,
                    'input': test_case['input'],
                    'expected': test_case['expected'],
                    'output': '',
                    'passed': False,
                    'execution_time': f">{app.config['CODE_TIMEOUT']}s",
                    'error': 'Time Limit Exceeded'
                })
            except Exception as e:
                all_passed = False
                results.append({
                    'test_case': i + 1,
                    'input': test_case['input'],
                    'expected': test_case['expected'],
                    'output': '',
                    'passed': False,
                    'execution_time': '0s',
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'all_passed': all_passed,
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/run', methods=['POST'])
def run_code():
    """Run code without test cases (for testing/debugging)"""
    try:
        data = request.get_json()
        code = data.get('code', '')
        
        if not code:
            return jsonify({'error': 'No code provided'}), 400
        
        if len(code) > app.config['MAX_CODE_LENGTH']:
            return jsonify({'error': 'Code too long'}), 400
        
        # Execute code with timeout
        start_time = time.time()
        result = subprocess.run(
            [sys.executable, '-c', code],
            capture_output=True,
            text=True,
            timeout=app.config['CODE_TIMEOUT']
        )
        execution_time = time.time() - start_time
        
        return jsonify({
            'success': True,
            'output': result.stdout,
            'error': result.stderr,
            'execution_time': f"{execution_time:.3f}s"
        })
        
    except subprocess.TimeoutExpired:
        return jsonify({
            'success': False,
            'error': 'Time Limit Exceeded'
        }), 408
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    app.run(host=app.config['HOST'], port=app.config['PORT'], debug=app.config['DEBUG'])
