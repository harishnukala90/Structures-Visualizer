// Configuration and static data for all 19 data structures

export const CATEGORIES = {
  primitives: 'Primitives',
  linear: 'Linear',
  nonlinear: 'Non-linear',
  'hash-based': 'Hash-Based',
  searching: 'Searching',
  sorting: 'Sorting'
};

export const DATA_STRUCTURES = [
  // --- PRIMITIVES ---
  {
    id: 'integer',
    name: 'Integer',
    category: 'primitives',
    description: 'A primitive data type representing a whole number (no fractional part), typically stored in 2s complement form in memory (4 bytes / 32 bits on modern systems).',
    complexities: { search: 'O(1)', insert: 'O(1)', delete: 'O(1)', space: 'O(1)' },
    pros: ['Constant time access', 'Hardware-level arithmetic support', 'Minimal memory overhead'],
    cons: ['Fixed size range (overflow risk)', 'Cannot represent fractions'],
    defaultState: { value: 42, size: 4 }, // value, size in bytes
    code: {
      c: `int value = 42; // Declare a 32-bit integer`,
      cpp: `int value = 42; // Declare a 32-bit signed integer`,
      java: `int value = 42; // 32-bit signed two's complement integer`,
      python: `value = 42  # Python ints have arbitrary precision (unlimited bits)`
    }
  },
  {
    id: 'float',
    name: 'Float',
    category: 'primitives',
    description: 'A single-precision floating-point number, typically adhering to the IEEE 754 standard (4 bytes: 1 sign bit, 8 exponent bits, 23 fraction/mantissa bits).',
    complexities: { search: 'O(1)', insert: 'O(1)', delete: 'O(1)', space: 'O(1)' },
    pros: ['Can represent huge ranges of fractional numbers', 'Hardware-accelerated via FPU'],
    cons: ['Floating point precision errors (roundoff)', 'Not suitable for exact values like currency'],
    defaultState: { value: 3.14, sign: 0, exponent: '10000000', mantissa: '10010001111010111000011' },
    code: {
      c: `float pi = 3.14f; // 32-bit floating point`,
      cpp: `float pi = 3.14f; // IEEE-754 32-bit float`,
      java: `float pi = 3.14f; // Single-precision 32-bit IEEE 754 float`,
      python: `pi = 3.14  # Python 'float' is actually a C double (64-bit)`
    }
  },
  {
    id: 'character',
    name: 'Character',
    category: 'primitives',
    description: 'A single unit of written language, representing an alphabet, digit, or symbol, stored as an integer value using systems like ASCII (1 byte) or Unicode/UTF-8.',
    complexities: { search: 'O(1)', insert: 'O(1)', delete: 'O(1)', space: 'O(1)' },
    pros: ['Compact representation of symbols', 'Fast character manipulation'],
    cons: ['ASCII is limited to 128 characters', 'Unicode encoding (UTF-8, UTF-16) adds multi-byte complexity'],
    defaultState: { value: 'A', ascii: 65, binary: '01000001' },
    code: {
      c: `char ch = 'A'; // Stores character literal (value 65)`,
      cpp: `char ch = 'A'; // 1-byte char type`,
      java: `char ch = 'A'; // 16-bit Unicode character type`,
      python: `ch = 'A'  # String of length 1 (no separate char type)`
    }
  },
  {
    id: 'boolean',
    name: 'Boolean',
    category: 'primitives',
    description: 'A logical data type that can have only two possible values: true or false (typically stored as 1 byte in memory for byte alignment).',
    complexities: { search: 'O(1)', insert: 'O(1)', delete: 'O(1)', space: 'O(1)' },
    pros: ['Extremely simple binary decisions', 'Minimal space complexity'],
    cons: ['Uses a full byte (8 bits) in most languages instead of a single bit due to memory addressing'],
    defaultState: { value: true },
    code: {
      c: `#include <stdbool.h>\nbool flag = true; // true represents 1, false represents 0`,
      cpp: `bool flag = true; // Boolean literal`,
      java: `boolean flag = true; // Boolean primitive type`,
      python: `flag = True  # capitalized True/False in Python`
    }
  },
  {
    id: 'pointer',
    name: 'Pointer',
    category: 'primitives',
    description: 'A primitive variable that stores the memory address of another variable, allowing direct memory manipulation and dynamic allocation.',
    complexities: { search: 'O(1)', insert: 'O(1)', delete: 'O(1)', space: 'O(1)' },
    pros: ['Enables dynamic memory allocation', 'Allows reference passing (fast function calls)'],
    cons: ['Prone to memory leaks, null pointers, and segmentation faults', 'Difficult to debug'],
    defaultState: { value: '0x7ffd', pointsTo: '0x7ffe', targetValue: 88 },
    code: {
      c: `int val = 88;\nint *ptr = &val; // ptr stores address of val`,
      cpp: `int val = 88;\nint* ptr = &val; // Pointer pointing to val's memory`,
      java: `// Java does not have explicit pointer variables.\n// Object references act as implicit safe pointers.`,
      python: `# Python does not have explicit pointers.\n# Names are bound to objects (implicit reference model).`
    }
  },

  // --- LINEAR ---
  {
    id: 'array1d',
    name: '1D Array',
    category: 'linear',
    description: 'A contiguous memory block storing items of the same type, allowing constant-time index-based random access.',
    complexities: { search: 'O(N)', insert: 'O(N)', delete: 'O(N)', space: 'O(N)' },
    pros: ['Fast random access O(1)', 'Cache-friendly due to contiguous memory spatial locality'],
    cons: ['Fixed size (cannot dynamically grow)', 'Expensive inserts/deletes due to element shifting'],
    defaultState: { arr: [12, 45, 78, 23, 56, 89], activeIdx: -1, label: '' },
    code: {
      c: `int arr[6] = {12, 45, 78, 23, 56, 89};\n\n// Index access\nint val = arr[2]; // O(1)`,
      cpp: `std::array<int, 6> arr = {12, 45, 78, 23, 56, 89};\nint val = arr[2];`,
      java: `int[] arr = {12, 45, 78, 23, 56, 89};\nint val = arr[2];`,
      python: `arr = [12, 45, 78, 23, 56, 89]  # Python list\nval = arr[2]`
    }
  },
  {
    id: 'array2d',
    name: '2D Array',
    category: 'linear',
    description: 'A grid-like array structure (rows and columns) stored in memory using Row-Major or Column-Major flat layout.',
    complexities: { search: 'O(R*C)', insert: 'O(R*C)', delete: 'O(R*C)', space: 'O(R*C)' },
    pros: ['Represents matrices, coordinates, grids easily', 'O(1) access if coordinates are known'],
    cons: ['Fixed sizes in both dimensions', 'Shifting elements is extremely slow'],
    defaultState: { grid: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], activeRow: -1, activeCol: -1 },
    code: {
      c: `int grid[3][3] = {\n  {1, 2, 3},\n  {4, 5, 6},\n  {7, 8, 9}\n};\nint val = grid[1][2]; // Row 1, Col 2 (5)`,
      cpp: `int grid[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};\nint val = grid[1][2];`,
      java: `int[][] grid = {\n  {1, 2, 3},\n  {4, 5, 6},\n  {7, 8, 9}\n};\nint val = grid[1][2];`,
      python: `grid = [\n  [1, 2, 3],\n  [4, 5, 6],\n  [7, 8, 9]\n]\nval = grid[1][2]  # Row 1, Col 2`
    }
  },
  {
    id: 'singly_linked_list',
    name: 'Singly Linked List',
    category: 'linear',
    description: 'A chain of nodes where each node contains data and a pointer/reference to the next node in the sequence.',
    complexities: { search: 'O(N)', insert: 'O(1) at head', delete: 'O(1) at head', space: 'O(N)' },
    pros: ['Dynamic size; easy insertions/deletions without shifting', 'No pre-allocated memory required'],
    cons: ['Sequential access only (no random access)', 'Extra memory overhead for pointer storage'],
    defaultState: { nodes: [10, 20, 30, 40], activeIdx: -1, pointerIdx: -1 },
    code: {
      c: `struct Node {\n    int data;\n    struct Node* next;\n};\n\nvoid insertAtHead(struct Node** head, int val) {\n    struct Node* new_node = malloc(sizeof(struct Node));\n    new_node->data = val;\n    new_node->next = *head;\n    *head = new_node;\n}`,
      cpp: `struct Node {\n    int data;\n    Node* next;\n    Node(int v) : data(v), next(nullptr) {}\n};`,
      java: `class Node {\n    int data;\n    Node next;\n    Node(int data) { this.data = data; }\n}`,
      python: `class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None`
    }
  },
  {
    id: 'doubly_linked_list',
    name: 'Doubly Linked List',
    category: 'linear',
    description: 'A chain of nodes where each node contains data and two pointers: one to the previous node and one to the next node.',
    complexities: { search: 'O(N)', insert: 'O(1)', delete: 'O(1)', space: 'O(N)' },
    pros: ['Can be traversed in both directions (forward and backward)', 'Deletions are faster if node reference is known'],
    cons: ['Higher memory cost (two pointers per node)', 'More complex pointer management on updates'],
    defaultState: { nodes: [15, 25, 35, 45], activeIdx: -1 },
    code: {
      c: `struct Node {\n    int data;\n    struct Node* prev;\n    struct Node* next;\n};`,
      cpp: `struct Node {\n    int data;\n    Node* prev;\n    Node* next;\n    Node(int v) : data(v), prev(nullptr), next(nullptr) {}\n};`,
      java: `class Node {\n    int data;\n    Node prev;\n    Node next;\n    Node(int d) { data = d; }\n}`,
      python: `class Node:\n    def __init__(self, data):\n        self.data = data\n        self.prev = None\n        self.next = None`
    }
  },
  {
    id: 'circular_linked_list',
    name: 'Circular Linked List',
    category: 'linear',
    description: 'A linked list where the last node points back to the first node, creating a continuous loop.',
    complexities: { search: 'O(N)', insert: 'O(1)', delete: 'O(1)', space: 'O(N)' },
    pros: ['Continuous looping (useful for round-robin scheduling)', 'Any node can be a starting point'],
    cons: ['Infinite loop danger during traversal if not terminated carefully', 'Slightly trickier circular link updates'],
    defaultState: { nodes: [5, 10, 15, 20], activeIdx: -1 },
    code: {
      c: `// Last node's next points to head node.\n// tail->next = head;`,
      cpp: `// Simple circular traversal loop\nNode* curr = head;\nif (head != nullptr) {\n    do {\n        std::cout << curr->data << " ";\n        curr = curr->next;\n    } while (curr != head);\n}`,
      java: `// Head node is linked by tail node\nNode curr = head;\ndo {\n    System.out.print(curr.data + " ");\n    curr = curr.next;\n} while (curr != head);`,
      python: `# Python circular list traversal\ncurr = head\nwhile True:\n    print(curr.data)\n    curr = curr.next\n    if curr == head:\n        break`
    }
  },
  {
    id: 'doubly_circular_linked_list',
    name: 'Doubly Circular LL',
    category: 'linear',
    description: 'A circular linked list where each node contains pointers to both the previous and next nodes. The tail node connects back to the head node, and the head node points back to the tail node, forming a complete bidirectional loop.',
    complexities: { search: 'O(N)', insert: 'O(1) at endpoints', delete: 'O(1) at endpoints', space: 'O(N)' },
    pros: ['Can traverse bidirectionally and circularly', 'Deletion of a node is fast O(1) if its reference is given', 'No NULL pointer checks needed'],
    cons: ['Requires double pointer overhead per node', 'Pointer assignments are complex during insertions and deletions'],
    defaultState: { nodes: [8, 16, 24, 32], activeIdx: -1 },
    code: {
      c: `struct Node {
    int data;
    struct Node* next;
    struct Node* prev;
};

void insertAtHead(struct Node** head, int val) {
    struct Node* newNode = malloc(sizeof(struct Node));
    newNode->data = val;
    if (*head == NULL) {
        newNode->next = newNode;
        newNode->prev = newNode;
        *head = newNode;
        return;
    }
    struct Node* tail = (*head)->prev;
    newNode->next = *head;
    newNode->prev = tail;
    (*head)->prev = newNode;
    tail->next = newNode;
    *head = newNode;
}`,
      cpp: `struct Node {
    int data;
    Node* next;
    Node* prev;
    Node(int d) : data(d), next(nullptr), prev(nullptr) {}
};

void insertAtHead(Node*& head, int val) {
    Node* newNode = new Node(val);
    if (!head) {
        newNode->next = newNode;
        newNode->prev = newNode;
        head = newNode;
        return;
    }
    Node* tail = head->prev;
    newNode->next = head;
    newNode->prev = tail;
    head->prev = newNode;
    tail->next = newNode;
    head = newNode;
}`,
      java: `class Node {
    int data;
    Node next, prev;
    Node(int d) { data = d; }
}

class DoublyCircularLinkedList {
    Node head = null;

    void insertAtHead(int val) {
        Node newNode = new Node(val);
        if (head == null) {
            newNode.next = newNode;
            newNode.prev = newNode;
            head = newNode;
            return;
        }
        Node tail = head.prev;
        newNode.next = head;
        newNode.prev = tail;
        head.prev = newNode;
        tail.next = newNode;
        head = newNode;
    }
}`,
      python: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None
        self.prev = None

class DoublyCircularList:
    def __init__(self):
        self.head = None

    def insert_at_head(self, val):
        new_node = Node(val)
        if not self.head:
            new_node.next = new_node
            new_node.prev = new_node
            self.head = new_node
            return
        tail = self.head.prev
        new_node.next = self.head
        new_node.prev = tail
        self.head.prev = new_node
        tail.next = new_node
        self.head = new_node`
    }
  },
  {
    id: 'stack',
    name: 'Stack',
    category: 'linear',
    description: 'A LIFO (Last In First Out) structure where items are pushed and popped from the same end (the top).',
    complexities: { search: 'O(N)', insert: 'O(1) [Push]', delete: 'O(1) [Pop]', space: 'O(N)' },
    pros: ['Very fast push and pop operations O(1)', 'Maintains recursion state / history stack'],
    cons: ['No random access (must pop everything to see bottom)', 'Stack overflow risk if capacity is exceeded'],
    defaultState: { stack: [10, 20, 30], activeIdx: -1, actionType: null },
    code: {
      c: `int stack[MAX];\nint top = -1;\n\nvoid push(int val) {\n    stack[++top] = val;\n}\nint pop() {\n    return stack[top--];\n}`,
      cpp: `#include <stack>\nstd::stack<int> s;\ns.push(10); // LIFO insert\ns.pop();    // LIFO remove`,
      java: `import java.util.Stack;\nStack<Integer> stack = new Stack<>();\nstack.push(10);\nstack.pop();`,
      python: `stack = []\nstack.append(10)  # Push\nstack.pop()       # Pop`
    }
  },
  {
    id: 'queue',
    name: 'Queue',
    category: 'linear',
    description: 'A FIFO (First In First Out) structure where items are inserted at the back (enqueue) and removed from the front (dequeue).',
    complexities: { search: 'O(N)', insert: 'O(1) [Enqueue]', delete: 'O(1) [Dequeue]', space: 'O(N)' },
    pros: ['Maintains ordering of items', 'Ideal for serialization, buffers, message queues'],
    cons: ['No random access (must dequeue front items first)'],
    defaultState: { queue: [11, 22, 33, 44], front: 0, rear: 3, activeIdx: -1 },
    code: {
      c: `int queue[MAX];\nint front = 0, rear = -1;\n\nvoid enqueue(int val) {\n    queue[++rear] = val;\n}\nint dequeue() {\n    return queue[front++];\n}`,
      cpp: `#include <queue>\nstd::queue<int> q;\nq.push(11); // Enqueue\nq.pop();    // Dequeue`,
      java: `import java.util.LinkedList;\nimport java.util.Queue;\nQueue<Integer> q = new LinkedList<>();\nq.add(11); // enqueue\nq.poll(); // dequeue`,
      python: `from collections import deque\nq = deque()\nq.append(11) # Enqueue\nq.popleft()  # Dequeue`
    }
  },
  {
    id: 'circular_queue',
    name: 'Circular Queue',
    category: 'linear',
    description: 'A queue where the last position is connected back to the first, resolving memory waste in array-based linear queues.',
    complexities: { search: 'O(N)', insert: 'O(1)', delete: 'O(1)', space: 'O(N)' },
    pros: ['Prevents memory leaks/shifts in array-based queue limits', 'Constant time operations'],
    cons: ['Fixed size capacity limits (requires resize logic)'],
    defaultState: { queue: [10, 20, null, null, 50, 60], front: 4, rear: 1, size: 6 },
    code: {
      c: `void enqueue(int val) {\n    if ((rear + 1) % MAX == front) return; // Full\n    rear = (rear + 1) % MAX;\n    q[rear] = val;\n}`,
      cpp: `// Enqueue\nrear = (rear + 1) % MAX;\nq[rear] = val;\n// Dequeue\nfront = (front + 1) % MAX;`,
      java: `// Circular index logic\nrear = (rear + 1) % capacity;\nq[rear] = val;\nfront = (front + 1) % capacity;`,
      python: `# Python circular queue index wraps around\nrear = (rear + 1) % max_size\nq[rear] = val\nfront = (front + 1) % max_size`
    }
  },
  {
    id: 'deque',
    name: 'Deque',
    category: 'linear',
    description: 'A Double-Ended Queue supporting insertion and deletion operations at both the front and rear endpoints.',
    complexities: { search: 'O(N)', insert: 'O(1) [Both ends]', delete: 'O(1) [Both ends]', space: 'O(N)' },
    pros: ['Highly versatile: can function as both stack and queue', 'Fast amortized O(1) edits at endpoints'],
    cons: ['More complex pointer manipulation than standard queue'],
    defaultState: { deque: [7, 8, 9, 10], frontIdx: 0, rearIdx: 3 },
    code: {
      c: `// Functions needed:\n// insertFront(), insertRear(), deleteFront(), deleteRear()`,
      cpp: `#include <deque>\nstd::deque<int> dq;\ndq.push_front(5);\ndq.push_back(10);\ndq.pop_front();\ndq.pop_back();`,
      java: `import java.util.ArrayDeque;\nimport java.util.Deque;\nDeque<Integer> dq = new ArrayDeque<>();\ndq.addFirst(5);\ndq.addLast(10);\ndq.removeFirst();`,
      python: `from collections import deque\ndq = deque()\ndq.append(10)      # push rear\ndq.appendleft(5)   # push front\ndq.pop()           # pop rear\ndq.popleft()       # pop front`
    }
  },

  // --- NON-LINEAR ---
  {
    id: 'bst',
    name: 'Binary Search Tree',
    category: 'nonlinear',
    description: 'A hierarchical node tree where each node has at most two children. The left subtree has smaller keys, and the right subtree has larger keys.',
    complexities: { search: 'O(log N) avg / O(N) worst', insert: 'O(log N) avg / O(N) worst', delete: 'O(log N) avg / O(N) worst', space: 'O(N)' },
    pros: ['Sorted order in-order traversal', 'Efficient searches, inserts, and deletes on average'],
    cons: ['Can degrade into a linear linked list (skewed tree) with worst case O(N) operations'],
    defaultState: {
      nodes: [
        { val: 50, parent: null, x: 50, y: 15, left: 30, right: 70 },
        { val: 30, parent: 50, x: 25, y: 35, left: 20, right: 40 },
        { val: 70, parent: 50, x: 75, y: 35, left: 60, right: 80 },
        { val: 20, parent: 30, x: 12, y: 55, left: null, right: null },
        { val: 40, parent: 30, x: 38, y: 55, left: null, right: null },
        { val: 60, parent: 70, x: 62, y: 55, left: null, right: null },
        { val: 80, parent: 70, x: 88, y: 55, left: null, right: null }
      ],
      activeVal: null,
      comparedVal: null
    },
    code: {
      c: `struct Node {\n    int val;\n    struct Node *left, *right;\n};\n\nstruct Node* search(struct Node* root, int key) {\n    if (root == NULL || root->val == key) return root;\n    if (key < root->val) return search(root->left, key);\n    return search(root->right, key);\n}`,
      cpp: `struct Node {\n    int val;\n    Node* left;\n    Node* right;\n};\nNode* insert(Node* node, int key) {\n    if (!node) return new Node(key);\n    if (key < node->val) node->left = insert(node->left, key);\n    else node->right = insert(node->right, key);\n    return node;\n}`,
      java: `class Node {\n    int val;\n    Node left, right;\n}\nNode search(Node root, int key) {\n    if (root == null || root.val == key) return root;\n    return (key < root.val) ? search(root.left, key) : search(root.right, key);\n}`,
      python: `def search(root, key):\n    if root is None or root.val == key:\n        return root\n    if key < root.val:\n        return search(root.left, key)\n    return search(root.right, key)`
    }
  },
  {
    id: 'avl',
    name: 'AVL Tree',
    category: 'nonlinear',
    description: 'A self-balancing Binary Search Tree where the difference in heights of left and right subtrees (Balance Factor) of any node is at most 1.',
    complexities: { search: 'O(log N)', insert: 'O(log N)', delete: 'O(log N)', space: 'O(N)' },
    pros: ['Guarantees O(log N) lookup, insertion, and deletion by avoiding skewing'],
    cons: ['Rotations on inserts/deletes introduce performance overhead and coding complexity'],
    defaultState: {
      nodes: [
        { val: 40, parent: null, bf: 0, x: 50, y: 15, left: 20, right: 60 },
        { val: 20, parent: 40, bf: 0, x: 25, y: 35, left: 10, right: 30 },
        { val: 60, parent: 40, bf: 0, x: 75, y: 35, left: null, right: null },
        { val: 10, parent: 20, bf: 0, x: 12, y: 55, left: null, right: null },
        { val: 30, parent: 20, bf: 0, x: 38, y: 55, left: null, right: null }
      ],
      activeVal: null,
      rotationLabel: ''
    },
    code: {
      c: `// Left Rotate and Right Rotate operations maintain balanced height\nint getBalanceFactor(struct Node* N) {\n    if (N == NULL) return 0;\n    return height(N->left) - height(N->right);\n}`,
      cpp: `Node* rightRotate(Node* y) {\n    Node* x = y->left;\n    Node* T2 = x->right;\n    x->right = y;\n    y->left = T2;\n    updateHeight(y);\n    updateHeight(x);\n    return x;\n}`,
      java: `// Left-Right or Right-Left balancing\nNode insert(Node node, int key) {\n    // 1. Normal BST insert...\n    // 2. Update height...\n    // 3. Balance code (Rotations: LL, RR, LR, RL)\n}`,
      python: `# Python AVL balance restoration\nbalance = get_balance(node)\nif balance > 1 and key < node.left.val:\n    return right_rotate(node)\n# Other cases...`
    }
  },
  {
    id: 'graph',
    name: 'Graph (BFS/DFS)',
    category: 'nonlinear',
    description: 'A collection of nodes (vertices) connected by links (edges). Can be traversed level-by-level (BFS) or depth-first (DFS).',
    complexities: { search: 'O(V + E)', insert: 'O(1) edge', delete: 'O(V + E)', space: 'O(V + E)' },
    pros: ['Models complex real-world systems like maps, networks, dependencies'],
    cons: ['Algorithms are complex to write and analyze', 'Cycle detection requires tracking visited states'],
    defaultState: {
      nodes: [
        { id: 'A', x: 50, y: 15, neighbors: ['B', 'C'] },
        { id: 'B', x: 25, y: 35, neighbors: ['A', 'D', 'E'] },
        { id: 'C', x: 75, y: 35, neighbors: ['A', 'F'] },
        { id: 'D', x: 12, y: 55, neighbors: ['B'] },
        { id: 'E', x: 38, y: 55, neighbors: ['B', 'F'] },
        { id: 'F', x: 75, y: 55, neighbors: ['C', 'E'] }
      ],
      visited: [],
      queueStack: [],
      activeNode: null,
      mode: 'BFS' // BFS or DFS
    },
    code: {
      c: `// Graph BFS representation (Adjacency Matrix/List + Queue)\nvoid BFS(int startVertex) {\n    visited[startVertex] = 1;\n    enqueue(startVertex);\n    while(!isEmpty()) {\n        int curr = dequeue();\n        // process neighbors...\n    }\n}`,
      cpp: `// DFS Traversal using Recursion/Call Stack\nvoid DFS(int u, std::vector<bool>& visited) {\n    visited[u] = true;\n    for(int v : adj[u]) {\n        if(!visited[v]) DFS(v, visited);\n    }\n}`,
      java: `// BFS using queue\nQueue<Integer> q = new LinkedList<>();\nq.add(start);\nvisited[start] = true;\nwhile (!q.isEmpty()) {\n    int curr = q.poll();\n    // check adjacent...\n}`,
      python: `def bfs(graph, start):\n    visited = set([start])\n    queue = [start]\n    while queue:\n        curr = queue.pop(0)\n        for neighbor in graph[curr]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)`
    }
  },

  // --- HASH-BASED ---
  {
    id: 'hash_table',
    name: 'Hash Table',
    category: 'hash-based',
    description: 'A key-value structure that maps keys to bucket indices using a hash function, resolving collisions using chaining (linked lists) or open addressing.',
    complexities: { search: 'O(1) avg / O(N) worst', insert: 'O(1) avg / O(N) worst', delete: 'O(1) avg / O(N) worst', space: 'O(N)' },
    pros: ['Extremely fast lookups, insertions, deletions O(1) on average'],
    cons: ['Collisions degrade performance', 'Hash functions can be expensive', 'Memory waste due to empty buckets'],
    defaultState: {
      buckets: [
        { index: 0, values: ['Apple'] },
        { index: 1, values: [] },
        { index: 2, values: ['Banana', 'Cherry'] },
        { index: 3, values: [] },
        { index: 4, values: ['Grapes'] }
      ],
      activeBucketIdx: -1,
      searchValue: ''
    },
    code: {
      c: `int hash(char* key) {\n    return strlen(key) % BUCKET_SIZE;\n}\n\nvoid insert(char* key) {\n    int idx = hash(key);\n    insert_node(&buckets[idx], key);\n}`,
      cpp: `// Standard Template Library hash table\n#include <unordered_map>\nstd::unordered_map<std::string, int> hash_table;\nhash_table["Apple"] = 100;\nauto it = hash_table.find("Apple");`,
      java: `import java.util.HashMap;\nHashMap<String, Integer> map = new HashMap<>();\nmap.put("Apple", 100);\nint val = map.get("Apple");`,
      python: `# Python Dictionary is a highly optimized hash table\nlookup = {"Apple": 100, "Banana": 200}\nval = lookup["Apple"]`
    }
  },
  {
    id: 'hash_set',
    name: 'Hash Set',
    category: 'hash-based',
    description: 'A collection of unique keys using a hash function backend. Ideal for checking value existence and enforcing element uniqueness.',
    complexities: { search: 'O(1) avg / O(N) worst', insert: 'O(1) avg / O(N) worst', delete: 'O(1) avg / O(N) worst', space: 'O(N)' },
    pros: ['Enforces uniqueness automatically', 'O(1) average lookup/membership testing'],
    cons: ['Unordered traversal (no sequence guarantee)', 'High memory overhead compared to bit-sets'],
    defaultState: {
      buckets: [
        { index: 0, keys: [10] },
        { index: 1, keys: [31] },
        { index: 2, keys: [] },
        { index: 3, keys: [43, 83] },
        { index: 4, keys: [] }
      ],
      activeBucketIdx: -1,
      searchKey: null
    },
    code: {
      c: `// Set membership test (hash key to index, check linked list for matching key)\nbool contains(int key) {\n    int idx = abs(key) % SIZE;\n    return list_contains(buckets[idx], key);\n}`,
      cpp: `#include <unordered_set>\nstd::unordered_set<int> my_set;\nmy_set.insert(10);\nbool has_10 = my_set.count(10) > 0;`,
      java: `import java.util.HashSet;\nHashSet<Integer> set = new HashSet<>();\nset.add(10);\nboolean exists = set.contains(10);`,
      python: `# Sets in Python use hash tables internally\nmy_set = {10, 31, 43, 83}\nexists = 10 in my_set`
    }
  },
  {
    id: 'linear_search',
    name: 'Linear Search',
    category: 'searching',
    description: 'A search algorithm that sequentially checks each element of a collection until a match is found or the end of the collection is reached.',
    complexities: { search: 'O(N)', insert: 'N/A', delete: 'N/A', space: 'O(1)' },
    pros: ['Works on both sorted and unsorted collections', 'Simple and straightforward implementation'],
    cons: ['Very slow for large datasets O(N) worst case'],
    defaultState: { arr: [12, 45, 78, 23, 56, 89], activeIdx: -1, label: '', structureType: 'array1d' },
    code: {
      c: `int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i; // Found target at index i
        }
    }
    return -1; // Target not found
}`,
      cpp: `int linearSearch(const std::vector<int>& arr, int target) {
    for (size_t i = 0; i < arr.size(); ++i) {
        if (arr[i] == target) {
            return i; // Found target
        }
    }
    return -1; // Not found
}`,
      java: `public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i; // Found target
        }
    }
    return -1; // Not found
}`,
      python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i  # Return index of match
    return -1  # Match not found`
    }
  },
  {
    id: 'binary_search',
    name: 'Binary Search',
    category: 'searching',
    description: 'A highly efficient search algorithm that finds the position of a target value within a sorted array. It compares the target value to the middle element and halves the search space recursively.',
    complexities: { search: 'O(log N)', insert: 'N/A', delete: 'N/A', space: 'O(1)' },
    pros: ['Extremely fast O(log N) average/worst case execution time'],
    cons: ['Requires the data to be fully sorted beforehand', 'Only works on random access structures like arrays'],
    defaultState: { arr: [5, 12, 23, 34, 45, 56, 67, 78, 89], activeIdx: -1, low: 0, high: 8, mid: -1, label: '', structureType: 'array1d' },
    code: {
      c: `int binarySearch(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) {
            return mid; // Found target
        }
        if (arr[mid] < target) {
            low = mid + 1; // Narrow to upper half
        } else {
            high = mid - 1; // Narrow to lower half
        }
    }
    return -1; // Not found
}`,
      cpp: `int binarySearch(const std::vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) {
            return mid; // Found target
        }
        if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}`,
      java: `public static int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) {
            return mid; // Found target
        }
        if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}`,
      python: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if arr[mid] == target:
            return mid  # Found target
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`
    }
  },
  // --- SORTING ---
  {
    id: 'bubble_sort',
    name: 'Bubble Sort',
    category: 'sorting',
    description: 'A simple comparison-based sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
    complexities: { best: 'O(N)', avg: 'O(N^2)', worst: 'O(N^2)', space: 'O(1)' },
    pros: ['Simple to understand and implement', 'Adaptive: O(N) when already sorted'],
    cons: ['Very slow: O(N^2) average and worst-case time complexity'],
    defaultState: { arr: [29, 10, 14, 37, 13], activeIdx1: -1, activeIdx2: -1, sortedIdx: 5, label: '' },
    code: {
      c: `void bubbleSort(int arr[], int n) {\n    for (int i = 0; i < n-1; i++) {\n        for (int j = 0; j < n-i-1; j++) {\n            if (arr[j] > arr[j+1]) {\n                int temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n        }\n    }\n}`,
      cpp: `void bubbleSort(std::vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 0; i < n-1; i++) {\n        for (int j = 0; j < n-i-1; j++) {\n            if (arr[j] > arr[j+1]) {\n                std::swap(arr[j], arr[j+1]);\n            }\n        }\n    }\n}`,
      java: `public static void bubbleSort(int[] arr) {\n    int n = arr.length;\n    for (int i = 0; i < n-1; i++) {\n        for (int j = 0; j < n-i-1; j++) {\n            if (arr[j] > arr[j+1]) {\n                int temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n        }\n    }\n}`,
      python: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n-1):\n        for j in range(n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr`
    }
  },
  {
    id: 'selection_sort',
    name: 'Selection Sort',
    category: 'sorting',
    description: 'Divides the array into sorted and unsorted parts. Repeatedly finds the minimum element from the unsorted part and puts it at the beginning.',
    complexities: { best: 'O(N^2)', avg: 'O(N^2)', worst: 'O(N^2)', space: 'O(1)' },
    pros: ['Simple and performs well on small lists', 'Minimizes swap operations: at most O(N) swaps'],
    cons: ['Always takes O(N^2) time, even if the array is already sorted'],
    defaultState: { arr: [29, 10, 14, 37, 13], activeIdx1: -1, activeIdx2: -1, minIdx: -1, sortedIdx: -1, label: '' },
    code: {
      c: `void selectionSort(int arr[], int n) {\n    for (int i = 0; i < n-1; i++) {\n        int min_idx = i;\n        for (int j = i+1; j < n; j++)\n            if (arr[j] < arr[min_idx])\n                min_idx = j;\n        int temp = arr[min_idx];\n        arr[min_idx] = arr[i];\n        arr[i] = temp;\n    }\n}`,
      cpp: `void selectionSort(std::vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 0; i < n-1; i++) {\n        int min_idx = i;\n        for (int j = i+1; j < n; j++)\n            if (arr[j] < arr[min_idx])\n                min_idx = j;\n        std::swap(arr[i], arr[min_idx]);\n    }\n}`,
      java: `public static void selectionSort(int[] arr) {\n    int n = arr.length;\n    for (int i = 0; i < n-1; i++) {\n        int minIdx = i;\n        for (int j = i+1; j < n; j++) {\n            if (arr[j] < arr[minIdx]) minIdx = j;\n        }\n        int temp = arr[minIdx];\n        arr[minIdx] = arr[i];\n        arr[i] = temp;\n    }\n}`,
      python: `def selection_sort(arr):\n    n = len(arr)\n    for i in range(n-1):\n        min_idx = i\n        for j in range(i+1, n):\n            if arr[j] < arr[min_idx]:\n                min_idx = j\n        arr[i], arr[min_idx] = arr[min_idx], arr[i]\n    return arr`
    }
  },
  {
    id: 'insertion_sort',
    name: 'Insertion Sort',
    category: 'sorting',
    description: 'Builds the sorted array one item at a time by repeatedly taking the next element and inserting it into its correct position relative to already-sorted elements.',
    complexities: { best: 'O(N)', avg: 'O(N^2)', worst: 'O(N^2)', space: 'O(1)' },
    pros: ['Very efficient for small or nearly sorted datasets', 'Stable sorting and in-place O(1) space'],
    cons: ['Inefficient for large datasets: O(N^2) average and worst case time'],
    defaultState: { arr: [29, 10, 14, 37, 13], activeIdx1: -1, activeIdx2: -1, keyVal: null, label: '' },
    code: {
      c: `void insertionSort(int arr[], int n) {\n    for (int i = 1; i < n; i++) {\n        int key = arr[i];\n        int j = i - 1;\n        while (j >= 0 && arr[j] > key) {\n            arr[j + 1] = arr[j];\n            j = j - 1;\n        }\n        arr[j + 1] = key;\n    }\n}`,
      cpp: `void insertionSort(std::vector<int>& arr) {\n    for (size_t i = 1; i < arr.size(); ++i) {\n        int key = arr[i];\n        int j = (int)i - 1;\n        while (j >= 0 && arr[j] > key) {\n            arr[j + 1] = arr[j];\n            j--;\n        }\n        arr[j + 1] = key;\n    }\n}`,
      java: `public static void insertionSort(int[] arr) {\n    for (int i = 1; i < arr.length; i++) {\n        int key = arr[i];\n        int j = i - 1;\n        while (j >= 0 && arr[j] > key) {\n            arr[j + 1] = arr[j];\n            j--;\n        }\n        arr[j + 1] = key;\n    }\n}`,
      python: `def insertion_sort(arr):\n    for i in range(1, len(arr)):\n        key = arr[i]\n        j = i - 1\n        while j >= 0 and arr[j] > key:\n            arr[j + 1] = arr[j]\n            j -= 1\n        arr[j + 1] = key\n    return arr`
    }
  },
  {
    id: 'merge_sort',
    name: 'Merge Sort',
    category: 'sorting',
    description: 'A Divide-and-Conquer algorithm. It recursively splits the array in halves, sorts each half, and merges the sorted halves back together.',
    complexities: { best: 'O(N log N)', avg: 'O(N log N)', worst: 'O(N log N)', space: 'O(N)' },
    pros: ['Guaranteed O(N log N) time complexity in all cases', 'Stable sort (maintains relative order of equal keys)'],
    cons: ['Requires extra auxiliary memory space O(N)', 'Slower than Quick Sort on average in practice'],
    defaultState: { arr: [29, 10, 14, 37, 13], activeIdx1: -1, activeIdx2: -1, tempArr: [], label: '' },
    code: {
      c: `void merge(int arr[], int l, int m, int r) {\n    // Merge helper code...\n}\nvoid mergeSort(int arr[], int l, int r) {\n    if (l < r) {\n        int m = l + (r - l) / 2;\n        mergeSort(arr, l, m);\n        mergeSort(arr, m + 1, r);\n        merge(arr, l, m, r);\n    }\n}`,
      cpp: `void mergeSort(std::vector<int>& arr, int l, int r) {\n    if (l < r) {\n        int m = l + (r - l) / 2;\n        mergeSort(arr, l, m);\n        mergeSort(arr, m + 1, r);\n        merge(arr, l, m, r);\n    }\n}`,
      java: `void mergeSort(int[] arr, int l, int r) {\n    if (l < r) {\n        int m = l + (r - l) / 2;\n        mergeSort(arr, l, m);\n        mergeSort(arr, m + 1, r);\n        merge(arr, l, m, r);\n    }\n}`,
      python: `def merge_sort(arr):\n    if len(arr) > 1:\n        mid = len(arr) // 2\n        L = arr[:mid]\n        R = arr[mid:]\n        merge_sort(L)\n        merge_sort(R)\n        # Merge logic...\n    return arr`
    }
  },
  {
    id: 'quick_sort',
    name: 'Quick Sort',
    category: 'sorting',
    description: 'A Divide-and-Conquer algorithm. It selects a pivot element, partitions the array around the pivot, and recursively sorts the sub-arrays.',
    complexities: { best: 'O(N log N)', avg: 'O(N log N)', worst: 'O(N^2)', space: 'O(log N)' },
    pros: ['Very fast on average: O(N log N) with small constant factors', 'Sorts in-place (no auxiliary array needed)'],
    cons: ['Worst case time complexity is O(N^2) if pivot choices are poor', 'Unstable sort'],
    defaultState: { arr: [29, 10, 14, 37, 13], pivotIdx: -1, activeIdx1: -1, activeIdx2: -1, label: '' },
    code: {
      c: `int partition(int arr[], int low, int high) {\n    int pivot = arr[high];\n    int i = (low - 1);\n    // Swap logic...\n}\nvoid quickSort(int arr[], int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}`,
      cpp: `void quickSort(std::vector<int>& arr, int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}`,
      java: `void quickSort(int[] arr, int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}`,
      python: `def quick_sort(arr, low, high):\n    if low < high:\n        pi = partition(arr, low, high)\n        quick_sort(arr, low, pi - 1)\n        quick_sort(arr, pi + 1, high)\n    return arr`
    }
  }
];
