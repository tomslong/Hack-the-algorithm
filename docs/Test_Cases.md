# Test Cases - AI Algorithm Engineer Module

## 1. User Skill Assessment
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-01 | Save Skills | 1. Go to Settings<br>2. Select 'Arrays' -> 4<br>3. Click Update | Toast "Skills profile updated", Backend stores value 4 |
| TC-02 | Persist Skills | 1. Refresh page<br>2. Check 'Arrays' value | Value should remain 4 |
| TC-03 | Visual Progress | 1. Go to Settings<br>2. Check Progress Bar | Bar filled to 80% (4/5) |

## 2. API Key Management
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-04 | Save Key | 1. Enter valid sk-... key<br>2. Click Save | Toast "Success", Input cleared, "Key configured" shown |
| TC-05 | Check Existence | 1. Refresh page | "Key is configured" message persists |
| TC-06 | Encryption | 1. Inspect `api_keys` table in SQLite | Key column contains encrypted string (not plain text) |

## 3. Personalized Tutor Engine
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-07 | Standard Tutor | 1. Set Mode: Tutor<br>2. Ask "What is an Array?" | Explanation suitable for skill level |
| TC-08 | Socratic Mode | 1. Set Mode: Socratic<br>2. Ask "How to reverse list?" | AI responds with a guiding question, not code |
| TC-09 | Challenge Mode | 1. Set Mode: Challenge<br>2. Ask for challenge | AI provides a problem statement |

## 4. Code Sandbox & Evaluation
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-10 | Run Code | 1. Type `print("test")`<br>2. Click Run | Output panel shows `test` |
| TC-11 | Syntax Error | 1. Type `print("test"` (missing paren)<br>2. Click Run | Output panel shows SyntaxError |
| TC-12 | Evaluate Code | 1. Write correct code<br>2. Click Evaluate | AI analyzes code and gives score/feedback |

## 5. Security & Stability
| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-13 | Missing Key | 1. Delete key<br>2. Try Chat | Error "API Key not configured" |
| TC-14 | Network Fail | 1. Stop backend<br>2. Click Save/Run | Frontend shows "Network error" toast |
