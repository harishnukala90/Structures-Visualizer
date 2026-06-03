import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      title: "Structures Visualizer",
      subtitle: "Interactive Learning & Visualization Playground",
      search: "Search",
      insert: "Insert",
      delete: "Delete",
      space: "Space",
      time: "Time",
      categories: "Categories",
      allStructures: "All Structures",
      structures: "Structures",
      stepCounter: "Step {{current}} / {{total}}",
      operations: "Operations",
      target: "Target:",
      dataType: {
        int: "int",
        float: "float",
        char: "char"
      },
      keyType: "Key Type:",
      num: "NUM",
      charLabel: "CHAR",
      structureLabel: "Structure:",
      structuresList: {
        array1d: "Array 1D",
        array2d: "Array 2D",
        singly_linked_list: "Singly Linked List",
        doubly_linked_list: "Doubly Linked List",
        stack: "Stack",
        queue: "Queue",
        deque: "Deque",
        tree: "Tree",
        bst: "BST",
        avl: "AVL Tree",
        bfs: "BFS",
        dfs: "DFS"
      },
      setValue: "Set Value",
      toggleLogicalValue: "Toggle Logical Value",
      insertAtIndex: "Insert At Index",
      deleteAtIndex: "Delete At Index",
      searchGrid: "Search Grid",
      insertAtRC: "Insert at (R, C)",
      deleteAtRC: "Delete at (R, C)",
      insertHead: "Insert Head",
      insertTail: "Insert Tail",
      deleteValue: "Delete Value",
      runSearch: "Run Search",
      runSort: "Run Sort",
      push: "Push",
      pop: "Pop",
      enqueue: "Enqueue",
      dequeue: "Dequeue",
      insertNode: "Insert Node",
      deleteNode: "Delete Node",
      inorder: "In-Order DFS",
      preorder: "Pre-Order DFS",
      postorder: "Post-Order DFS",
      levelorder: "Level-Order BFS",
      traverse: "Traverse",
      runTraversal: "Run Traversal",
      animationTimelineControls: "Animation Timeline Controls",
      speedSlider: "SPEED SLIDER",
      details: "Details & Analysis",
      advantages: "Advantages (Pros)",
      disadvantages: "Disadvantages (Cons)",
      standardImplementation: "Standard Implementation",
      footerText: "Data Structures Visualizer built in React & Tailwind CSS v4.",
      systemIdle: "System idle. Perform an operation below to run animations.",
      visualizerSuffix: "Visualizer",
      resetState: "Reset State",
      stepBackward: "Step Backward",
      play: "Play",
      pause: "Pause",
      stepForward: "Step Forward",
      placeholder: {
        keyTable: "Key (e.g. Apple)",
        char: "A",
        num: "0",
        index: "Index",
        row: "Row",
        col: "Col",
        front: "Front",
        rear: "Rear"
      },
      categoriesList: {
        primitives: "Primitives",
        linear: "Linear",
        nonlinear: "Non-linear",
        "hash-based": "Hash-Based",
        searching: "Searching",
        sorting: "Sorting"
      },
      structuresData: {
        integer: "Integer",
        float: "Float",
        character: "Character",
        boolean: "Boolean",
        pointer: "Pointer",
        array1d: "1D Array",
        array2d: "2D Array",
        singly_linked_list: "Singly Linked List",
        doubly_linked_list: "Doubly Linked List",
        circular_linked_list: "Circular Linked List",
        doubly_circular_linked_list: "Doubly Circular LL",
        stack: "Stack",
        queue: "Queue",
        circular_queue: "Circular Queue",
        deque: "Deque",
        bst: "Binary Search Tree",
        avl: "AVL Tree",
        graph: "Graph (BFS/DFS)",
        hash_table: "Hash Table",
        hash_set: "Hash Set",
        linear_search: "Linear Search",
        binary_search: "Binary Search",
        bubble_sort: "Bubble Sort",
        selection_sort: "Selection Sort",
        insertion_sort: "Insertion Sort",
        merge_sort: "Merge Sort",
        quick_sort: "Quick Sort"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
