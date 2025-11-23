# DSA Learning Platform

A comprehensive web application for learning Data Structures and Algorithms from zero to hero, built with Python Flask and featuring an integrated online judge system for practice problems.

## Features

- 📚 **Interactive Learning**: Comprehensive lessons on data structures (Arrays, Linked Lists, Stacks, Queues, Trees) and algorithms (Sorting, Searching, Recursion, Dynamic Programming)
- 💻 **Online Judge System**: Practice coding problems with automated test case validation
- 🐳 **Docker Support**: Easy deployment using Docker containers
- 🎨 **Clean UI**: Simple, user-friendly interface focused on learning
- ⚡ **Real-time Code Execution**: Run and test your code directly in the browser

## Technology Stack

- **Backend**: Python Flask 3.0.0
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Containerization**: Docker & Docker Compose
- **Code Execution**: Python subprocess with security constraints

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Docker (optional, for containerized deployment)

### Local Installation

1. Clone the repository:
```bash
git clone https://github.com/tomslong/Hack-the-algorithm.git
cd Hack-the-algorithm
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

### Docker Installation

1. Clone the repository:
```bash
git clone https://github.com/tomslong/Hack-the-algorithm.git
cd Hack-the-algorithm
```

2. Build and run with Docker Compose:
```bash
docker-compose up --build
```

3. Open your browser and navigate to:
```
http://localhost:5000
```

To run in detached mode:
```bash
docker-compose up -d
```

To stop the application:
```bash
docker-compose down
```

## Project Structure

```
Hack-the-algorithm/
├── app.py                 # Main Flask application
├── config.py             # Application configuration
├── requirements.txt      # Python dependencies
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
├── .dockerignore        # Docker ignore file
├── templates/           # HTML templates
│   ├── base.html       # Base template
│   ├── home.html       # Home page
│   ├── topic.html      # Learning topic page
│   ├── problems.html   # Problems list page
│   └── problem_detail.html  # Individual problem page
└── static/             # Static files
    └── css/
        └── style.css   # Application styles
```

## Learning Content

### Data Structures
- **Arrays**: Contiguous memory storage with O(1) access
- **Linked Lists**: Dynamic structures with pointer-based connections
- **Stacks**: LIFO (Last In First Out) operations
- **Queues**: FIFO (First In First Out) operations
- **Trees**: Hierarchical structures with parent-child relationships

### Algorithms
- **Sorting**: Bubble Sort, Selection Sort, Merge Sort, Quick Sort
- **Searching**: Linear Search, Binary Search
- **Recursion**: Factorial, Fibonacci, Tower of Hanoi
- **Dynamic Programming**: Memoization, Tabulation, Classic DP problems

## Practice Problems

The platform includes several practice problems:
1. **Two Sum** (Easy): Find two numbers that add up to a target
2. **Reverse String** (Easy): Reverse a string in-place
3. **Valid Parentheses** (Easy): Check if parentheses are balanced
4. **Binary Search** (Easy): Implement binary search algorithm
5. **Merge Sorted Arrays** (Medium): Merge two sorted arrays

Each problem includes:
- Problem description with examples
- Starter code template
- Automated test cases
- Real-time execution and validation

## Configuration

Edit `config.py` to customize application settings:

```python
class Config:
    SECRET_KEY = 'your-secret-key'
    DEBUG = False
    HOST = '0.0.0.0'
    PORT = 5000
    CODE_TIMEOUT = 5  # seconds
    MAX_CODE_LENGTH = 10000  # characters
```

Environment variables can be set in `docker-compose.yml` or directly in your environment:
- `SECRET_KEY`: Flask secret key (change in production)
- `DEBUG`: Enable debug mode (True/False)
- `HOST`: Host address (default: 0.0.0.0)
- `PORT`: Port number (default: 5000)

## Security Considerations

⚠️ **Important**: This is a **starter/demo application** intended for educational purposes and local development. It is **NOT production-ready** and should **NOT** be deployed to public-facing servers without significant security hardening.

### Current Security Measures
- Code execution timeout (5 seconds default)
- Maximum code length limit (10,000 characters)
- Basic input validation

### Known Security Limitations
This starter application has the following security limitations that must be addressed before production use:

1. **Code Execution**: Uses subprocess to execute arbitrary Python code without proper sandboxing
2. **No User Isolation**: All code runs in the same environment without containerization per execution
3. **XSS Vulnerabilities**: Some user inputs are not fully sanitized
4. **No Rate Limiting**: No protection against abuse or DoS attacks
5. **Secret Key**: Uses a default secret key (must be changed for production)

### For Production Deployment
If you plan to deploy this publicly, consider:
- Implementing proper code sandboxing (e.g., using Docker containers per execution)
- Adding user authentication and authorization
- Implementing rate limiting and request throttling
- Using a production WSGI server (e.g., Gunicorn, uWSGI)
- Adding HTTPS/SSL encryption
- Implementing proper input sanitization and CSP headers
- Setting up monitoring and logging
- Running application as non-root user in containers
- Updating to latest secure versions of all dependencies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with Flask framework
- Designed for educational purposes
- Inspired by coding platforms like LeetCode and HackerRank
