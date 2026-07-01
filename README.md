# 🎴 24-points-modern-SPA

<p align="center">
  <img src="https://img.shields.io/github/license/connectedGraph/24-points-modern-SPA?style=for-the-badge&color=blue" alt="License" />
  <img src="https://img.shields.io/github/repo-size/connectedGraph/24-points-modern-SPA?style=for-the-badge&color=green" alt="Repo Size" />
  <img src="https://img.shields.io/badge/Language-HTML5%20%7C%20CSS3%20%7C%20ES6+-orange?style=for-the-badge" alt="Tech Stack" />
  <img src="https://img.shields.io/badge/Math%20Engine-Fraction.js-purple?style=for-the-badge" alt="Math Engine" />
</p>

A premium, responsive, and feature-rich **24-Point Math Game** built as a zero-dependency Modern Single Page Application (SPA). It features an advanced mathematical solver powered by **AST Flattening & Canonical Hashing** to filter out structurally equivalent duplicate solutions.

---

## ✨ Core Features

*   **🧮 Fraction Math Engine**: Performs exact rational arithmetic, avoiding floating-point rounding errors. Capable of finding fractional solutions such as $(3 - 8/3) \times 8 = 24$.
*   **🖱️ Dynamic Drag & Drop Interaction**: A physical-feeling card collision mechanic. Drag numbers together and press `W`/`A`/`S`/`D` keys to trigger arithmetic operations (+, -, *, /).
*   **🎨 Premium Glassmorphic Themes**: Toggle between 6 curated visual aesthetics including Glass, Paper 🪵, Bamboo 🎋, Leather 📜, Dark 🩸, and Plain White ⚪.
*   **🌐 Comprehensive I18n**: Fully localized user interface with support for English, Chinese (简体中文), Spanish (Español), German (Deutsch), and French (Français).
*   **📊 History & PDF Export**: Track performance, review history, export logs as Markdown, and print cheat-sheets/wrong-question sets directly.

---

## 🧠 Algorithmic Deep Dive: Canonical Uniqueness Solver

Traditional 24-point solvers generate thousands of duplicate steps that are mathematically identical due to the **commutative** ($a + b = b + a$) and **associative** ($(a + b) + c = a + (b + c)$) properties. 

This repository implements a **two-stage reduction algorithm** to ensure that only **mathematically unique** solutions are presented.

### 1. Abstract Syntax Tree (AST) Flattening
Binary operators that are associative are flattened into multi-operand nodes. Continuous additions/subtractions are merged into a single `ADD` node, and continuous multiplications/divisions are merged into a single `MUL` node.

```mermaid
graph TD
    subgraph Binary Tree (Standard)
        subgraph Group1 [((8 / 1) / (1 / 3))]
            n1["/"] --> n2["/"]
            n1 --> n3["/"]
            n2 --> v1[8]
            n2 --> v2[1]
            n3 --> v3[1]
            n3 --> v4[3]
        end
    end
    subgraph Flattened Multi-operand AST (Ours)
        subgraph Group2 [MUL Block]
            mul["MUL Node"]
            mul --> f1["* 8"]
            mul --> f2["/ 1"]
            mul --> f3["/ 1"]
            mul --> f4["* 3"]
        end
    end
```

### 2. Canonical Hashing
During the hashing phase, operands within any `ADD` or `MUL` node are sorted lexicographically based on their sub-hashes. This guarantees that no matter what the evaluation order is (e.g., $3 \times 8$ or $8 \times 3$), they map to the exact same fingerprint.

*   **Sign Normalization**: Negative expressions are normalized. For instance, the expression $-(3 - 5)$ and $(5 - 3)$ are automatically resolved to the same canonical representation.

```javascript
// A snippet of the core sorting/normalization logic in script.js
termHashes.sort(); // Lexicographical sorting guarantees commutativity
let h = "(ADD" + termHashes.join("") + ")";
return is_neg ? "-" + h : h;
```

---

## 🚀 Getting Started

Since this is a client-side SPA with **zero dependencies**, you can run it immediately without any build step:

1. Clone this repository:
   ```bash
   git clone https://github.com/connectedGraph/24-points-modern-SPA.git
   ```
2. Open [24points.html](file:///D:/1/CS%26AI/01-Algorithms/24%E7%82%B9%E6%B8%B8%E6%88%8F/24points.html) directly in any modern web browser!

---

## 🛠️ Technology Stack

*   **Frontend Structure**: HTML5 Semantic Markup
*   **Styling & Themes**: CSS Custom Properties & Glassmorphism
*   **Logic Engine**: Vanilla ES6+ Javascript
*   **Solver Paradigm**: Recursive Backtracking with AST Normalization

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
