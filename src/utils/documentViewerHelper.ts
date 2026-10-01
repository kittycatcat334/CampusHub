import { DocumentFileType, DocumentItem } from '../types';

export function detectFileType(fileName: string, mimeType?: string): DocumentFileType {
  const lower = (fileName || '').toLowerCase().trim();
  if (mimeType) {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('officedocument.wordprocessingml')) return 'word';
    if (mimeType.includes('excel') || mimeType.includes('officedocument.spreadsheetml') || mimeType.includes('csv')) return 'excel';
    if (mimeType.includes('image')) return 'image';
  }

  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx') || lower.endsWith('.doc') || lower.endsWith('.rtf') || lower.endsWith('.odt')) return 'word';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv') || lower.endsWith('.tsv')) return 'excel';
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp') || lower.endsWith('.svg')) return 'image';
  if (lower.endsWith('.py') || lower.endsWith('.java') || lower.endsWith('.cpp') || lower.endsWith('.c') || lower.endsWith('.js') || lower.endsWith('.ts') || lower.endsWith('.tsx') || lower.endsWith('.html') || lower.endsWith('.sql')) return 'code';
  if (lower.endsWith('.txt') || lower.endsWith('.md')) return 'text';

  return 'pdf'; // default academic format
}

export interface SpreadsheetCell {
  value: string | number;
  formula?: string;
  isHeader?: boolean;
  isTotal?: boolean;
  align?: 'left' | 'center' | 'right';
  highlight?: 'green' | 'amber' | 'blue' | 'rose';
}

export interface SpreadsheetSheet {
  name: string;
  columns: string[];
  rows: (string | number | SpreadsheetCell)[][];
}

export interface DocumentModel {
  title: string;
  fileName: string;
  fileType: DocumentFileType;
  author: string;
  course: string;
  date: string;
  fileSize: string;
  wordCount?: number;
  pageCount?: number;
  // Content blocks for PDF & Word
  sections: {
    heading: string;
    paragraphs: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
    callout?: string;
    codeSnippet?: string;
  }[];
  // Multi-sheet data for Excel
  sheets?: SpreadsheetSheet[];
}

export function generateAcademicDocumentContent(doc: DocumentItem): DocumentModel {
  const fileType = doc.fileType || detectFileType(doc.fileName);
  const cleanTitle = doc.title || doc.fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  const author = doc.authorName || (doc.authorRole === 'teacher' ? 'Course Faculty' : 'Alex Rivera (Student)');
  const course = doc.courseName ? `${doc.courseCode ? doc.courseCode + ' • ' : ''}${doc.courseName}` : 'CampusHub Academic Coursework';
  const date = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : 'Fall Semester 2026';

  // Excel content generator
  if (fileType === 'excel') {
    const isGrades = cleanTitle.toLowerCase().includes('grade') || cleanTitle.toLowerCase().includes('roster') || cleanTitle.toLowerCase().includes('rubric');
    const isMatrix = cleanTitle.toLowerCase().includes('matrix') || cleanTitle.toLowerCase().includes('calc') || cleanTitle.toLowerCase().includes('math');

    if (isGrades) {
      return {
        title: cleanTitle,
        fileName: doc.fileName,
        fileType: 'excel',
        author,
        course,
        date,
        fileSize: doc.fileSize || '142 KB',
        sections: [],
        sheets: [
          {
            name: 'Gradebook_Summary',
            columns: ['A: Student ID', 'B: Full Name', 'C: Midterm (100)', 'D: Labs Avg (100)', 'E: HW Avg (100)', 'F: Final Score', 'G: Letter Grade'],
            rows: [
              ['STU-2024-8841', 'Alex Rivera', 94, 98, 92, '=C2*0.3+D2*0.4+E2*0.3', 'A'],
              ['STU-2024-9120', 'Maya Lin', 98, 100, 96, '=C3*0.3+D3*0.4+E3*0.3', 'A+'],
              ['STU-2024-4412', 'Ethan Vance', 82, 88, 85, '=C4*0.3+D4*0.4+E4*0.3', 'B'],
              ['STU-2024-7731', 'Chloe Zhao', 91, 94, 89, '=C5*0.3+D5*0.4+E5*0.3', 'A-'],
              ['STU-2024-3290', 'Marcus Aurelius', 88, 90, 86, '=C6*0.3+D6*0.4+E6*0.3', 'B+'],
              ['STU-2024-6019', 'Siddharth Patel', 95, 96, 94, '=C7*0.3+D7*0.4+E7*0.3', 'A'],
              ['STU-2024-5114', 'Jessica Taylor', 79, 84, 80, '=C8*0.3+D8*0.4+E8*0.3', 'B-'],
              ['STU-2024-2198', 'David Kim', 90, 92, 91, '=C9*0.3+D9*0.4+E9*0.3', 'A-'],
              ['Average', 'Class Cohort', 89.6, 92.8, 89.1, '=AVERAGE(F2:F9)', 'A-']
            ]
          },
          {
            name: 'Weighting_Schema',
            columns: ['Assessment Category', 'Weight (%)', 'Total Deliverables', 'Drop Lowest', 'Due Window'],
            rows: [
              ['Weekly Problem Sets', '30%', '8 Assignments', 'Yes (1)', 'Thursdays 17:00'],
              ['Laboratory Experiments', '40%', '5 Practicals', 'No', 'Fridays 23:59'],
              ['Midterm Examination', '15%', '1 Exam', 'No', 'Mid-October'],
              ['Final Term Project', '15%', '1 Capstone', 'No', 'End of Term']
            ]
          }
        ]
      };
    }

    if (isMatrix) {
      return {
        title: cleanTitle,
        fileName: doc.fileName,
        fileType: 'excel',
        author,
        course,
        date,
        fileSize: doc.fileSize || '184 KB',
        sections: [],
        sheets: [
          {
            name: 'Matrix_Operations',
            columns: ['Vector/Row', 'x₁ (Basis 1)', 'x₂ (Basis 2)', 'x₃ (Basis 3)', 'Determinant |A|', 'Rank Dim', 'Nullity Dim'],
            rows: [
              ['Row Vector v₁', 4.00, -2.00, 1.00, 18.00, 3, 0],
              ['Row Vector v₂', 0.00, 3.00, 5.00, '=B2*C3-C2*B3', 3, 0],
              ['Row Vector v₃', 1.00, 2.00, -1.00, '=SUM(B4:D4)', 3, 0],
              ['Transformation T(v)', 7.00, 14.00, 21.00, '=B2+B3+B4', 3, 'Passed'],
              ['Eigenvalue λ₁', 5.24, 0.00, 0.00, 'Real root', 1, 'Valid'],
              ['Eigenvalue λ₂', 0.00, -2.18, 0.00, 'Real root', 1, 'Valid'],
              ['Eigenvalue λ₃', 0.00, 0.00, 2.94, 'Real root', 1, 'Valid'],
              ['Rank-Nullity Sum', 3, 0, '=B9+C9', 'Dimension = 3', 3, 'Verified']
            ]
          },
          {
            name: 'Projection_Coordinates',
            columns: ['Subspace Basis', 'Projection u₁', 'Projection u₂', 'Orthogonal Comp u⊥', 'Norm ||u||', 'Status'],
            rows: [
              ['Col(A) Basis 1', 0.894, 0.447, 0.000, 1.000, 'Orthonormal'],
              ['Col(A) Basis 2', -0.447, 0.894, 0.000, 1.000, 'Orthonormal'],
              ['Null(A) Kernel', 0.000, 0.000, 0.000, 0.000, 'Zero Subspace']
            ]
          }
        ]
      };
    }

    return {
      title: cleanTitle,
      fileName: doc.fileName,
      fileType: 'excel',
      author,
      course,
      date,
      fileSize: doc.fileSize || '184 KB',
      sections: [],
      sheets: [
        {
          name: 'Experimental_Data',
          columns: ['Trial #', 'Input Voltage (V)', 'Current (mA)', 'Resistance (Ω)', 'Measured Power (mW)', 'Error %', 'Verification'],
          rows: [
            ['T-01', 2.50, 12.45, 200.80, 31.12, 0.40, 'Passed'],
            ['T-02', 5.00, 24.88, 200.96, 124.40, 0.48, 'Passed'],
            ['T-03', 7.50, 37.32, 200.96, 279.90, 0.48, 'Passed'],
            ['T-04', 10.00, 49.75, 201.00, 497.50, 0.50, 'Passed'],
            ['T-05', 12.50, 62.19, 201.00, 777.38, 0.50, 'Passed'],
            ['T-06', 15.00, 74.60, 201.07, 1119.00, 0.53, 'Passed'],
            ['T-07', 17.50, 87.05, 201.03, 1523.38, 0.51, 'Passed'],
            ['T-08', 20.00, 99.50, 201.00, 1990.00, 0.50, 'Passed'],
            ['Mean', '=AVERAGE(B2:B9)', '=AVERAGE(C2:C9)', '=AVERAGE(D2:D9)', '=SUM(E2:E9)', '0.49%', '100% Validated']
          ]
        },
        {
          name: 'Regression_Analysis',
          columns: ['Statistical Metric', 'Calculated Value', 'Standard Uncertainty', 'Accepted Theoretical', 'Residual Margin'],
          rows: [
            ['Slope (dI/dV)', '0.004975 S', '± 0.000012 S', '0.005000 S', '-0.50%'],
            ['Intercept (I₀)', '0.00012 A', '± 0.00004 A', '0.00000 A', 'Negligible'],
            ['Correlation R²', '0.99998', 'N/A', '1.00000', 'High Precision'],
            ['Calculated Resistance', '201.01 Ω', '± 0.22 Ω', '200.00 Ω', '+0.50%']
          ]
        }
      ]
    };
  }

  // Word Document content generator
  if (fileType === 'word') {
    const isRubricOrRequirements = cleanTitle.toLowerCase().includes('rubric') || cleanTitle.toLowerCase().includes('require') || cleanTitle.toLowerCase().includes('guideline') || cleanTitle.toLowerCase().includes('spec');
    const isSyllabus = cleanTitle.toLowerCase().includes('syllabus') || cleanTitle.toLowerCase().includes('policy');

    if (isRubricOrRequirements) {
      return {
        title: cleanTitle,
        fileName: doc.fileName,
        fileType: 'word',
        author,
        course,
        date,
        fileSize: doc.fileSize || '380 KB',
        wordCount: 1450,
        pageCount: 3,
        sections: [
          {
            heading: '1. Project Scope & Deliverable Overview',
            paragraphs: [
              'This specification defines the mandatory milestones, structural components, coding standards, and empirical verification benchmarks required for your submission.',
              'Students are expected to deliver a fully functional implementation accompanied by complete test coverage, formatted technical write-up, and reproducible execution instructions.'
            ],
            callout: 'Important: All submissions must pass automated static analysis and memory safety inspections. Late turn-ins incur a 10% deduction per 24-hour window.'
          },
          {
            heading: '2. Formal Assessment Rubric & Point Distribution',
            paragraphs: [
              'Deliverables are graded according to four objective criteria: Correctness, Algorithmic Efficiency, Code Craftsmanship, and Technical Documentation.'
            ],
            table: {
              headers: ['Evaluation Dimension', 'Exemplary (90-100%)', 'Proficient (80-89%)', 'Developing (70-79%)', 'Weight'],
              rows: [
                ['Functional Correctness', 'Passes 100% of adversarial unit test cases', 'Passes ≥ 90% of test suites with minor edge-case failures', 'Fails multiple core test cases', '40%'],
                ['Theoretical Runtime Bound', 'Strict O(log n) confirmed with empirical graphs', 'Complies with theoretical limits with mild memory overhead', 'Degrades to O(n) under unbalanced inputs', '25%'],
                ['Documentation & Rigor', 'Complete proofs, clear formatting, LaTeX derivations', 'Adequate documentation with minor gaps', 'Missing proof steps or unclear methodology', '20%'],
                ['Code Style & Test Suite', 'Clean modular design, descriptive names, zero leaks', 'Functional structure with minimal formatting warnings', 'Poor indentation, dead code, or compiler warnings', '15%']
              ]
            }
          },
          {
            heading: '3. Submission Guidelines & Packaging Checklist',
            paragraphs: [
              'Before turning in your work through CampusHub, verify that your submission includes: (1) Compiled PDF report or Word manuscript, (2) Clean source directory with build script or Makefile, and (3) Benchmarking spreadsheet (.xlsx or .csv) documenting experimental trial results.',
              'Submit all files using the Coursework Portal upload interface prior to the posted deadline cutoff.'
            ]
          }
        ]
      };
    }

    if (isSyllabus) {
      return {
        title: cleanTitle,
        fileName: doc.fileName,
        fileType: 'word',
        author,
        course,
        date,
        fileSize: doc.fileSize || '310 KB',
        wordCount: 1820,
        pageCount: 4,
        sections: [
          {
            heading: 'Course Overview & Educational Objectives',
            paragraphs: [
              'Welcome to this semester’s curriculum. This course introduces rigorous theoretical models, mathematical foundations, and real-world system implementations.',
              'By the conclusion of this term, students will demonstrate mastery over fundamental algorithms, formal proofs of correctness, and empirical analysis of computational efficiency.'
            ],
            callout: 'Office Hours: Mondays & Wednesdays 3:00 PM - 5:00 PM. Teaching Assistant review sessions are held every Friday in Turing Hall 304.'
          },
          {
            heading: 'Grading Scale & Coursework Breakdown',
            paragraphs: [
              'Grades are computed deterministically according to the following weighted distribution:'
            ],
            table: {
              headers: ['Component', 'Weight', 'Description', 'Frequency'],
              rows: [
                ['Problem Sets & Homework', '25%', 'Individual problem sets reinforcing theoretical proofs', 'Weekly'],
                ['Laboratory Practicals', '30%', 'Hands-on programming and experimental bench tests', 'Bi-weekly'],
                ['Midterm Examination', '20%', 'Comprehensive midterm testing conceptual mastery', 'Week 7'],
                ['Final Capstone Project', '25%', 'Substantial team-based software engineering project', 'End of Term']
              ]
            }
          },
          {
            heading: 'Academic Integrity & Collaboration Policy',
            paragraphs: [
              'Discussion of general principles is strongly encouraged; however, all submitted code, proof derivations, and written reports must represent each student’s own authentic work.',
              'Unauthorized sharing of solution keys or use of automated code generation tools without citation constitutes a direct violation of university policy.'
            ]
          }
        ]
      };
    }

    return {
      title: cleanTitle,
      fileName: doc.fileName,
      fileType: 'word',
      author,
      course,
      date,
      fileSize: doc.fileSize || '342 KB',
      wordCount: 1650,
      pageCount: 3,
      sections: [
        {
          heading: '1. Executive Summary & Problem Scope',
          paragraphs: [
            'This academic manuscript details the rigorous structural implementation, architectural testing, and algorithmic performance benchmarks of our semester coursework deliverable.',
            'The primary hypothesis investigates whether the proposed implementation meets all computational upper bounds O(log n) while maintaining strict memory overhead limits and thread-safety under heavy concurrent transactions.'
          ],
          callout: 'Core Takeaway: Across all 10,000 synthetic test benchmarks, our balanced tree implementation exhibited zero memory leaks with asymptotic runtime conforming strictly to theoretical predictions.'
        },
        {
          heading: '2. Methodology & Formal System Model',
          paragraphs: [
            'To validate correctness, unit test suites were executed across multiple permutations of random and adversarial insertion sequences. The rotation logic was monitored using automated invariant checkers verifying node coloration and black-height consistency.',
            'The following comparative matrix outlines key latency and complexity metrics obtained across diverse workload distributions:'
          ],
          table: {
            headers: ['Operation Phase', 'Asymptotic Bound', 'Empirical Latency (μs)', 'Cache Hit Ratio (%)', 'Verification'],
            rows: [
              ['Root Tree Initialization', 'O(1)', '0.42 μs', '99.8%', 'Confirmed'],
              ['Node Insertion & Recoloring', 'O(log n)', '3.18 μs', '97.2%', 'Conforms'],
              ['Left / Right Subtree Rotation', 'O(1)', '0.85 μs', '98.9%', 'Conforms'],
              ['In-Order Traversal (Sorted)', 'O(n)', '42.10 μs', '99.4%', 'Optimal'],
              ['Target Element Search', 'O(log n)', '2.94 μs', '98.1%', 'Conforms']
            ]
          }
        },
        {
          heading: '3. Empirical Results & Discussion',
          paragraphs: [
            'Analysis of the recorded memory footprints confirms that pointer overhead remains capped at 24 bytes per node, yielding optimal cache line packing on x86-64 microarchitectures.',
            'Furthermore, the empirical error bounds fell well below the 1.0% threshold, demonstrating that edge cases such as zig-zag dual rotations and duplicate keys are handled deterministically without runtime degradation.'
          ]
        },
        {
          heading: '4. Conclusion & Submission Sign-Off',
          paragraphs: [
            'All rubric deliverables, test suite logs, and commented source files have been compiled and verified in accordance with departmental guidelines. The enclosed implementation is fully reproducible.'
          ]
        }
      ]
    };
  }

  // Default PDF Document content generator
  const isGuide = cleanTitle.toLowerCase().includes('guide') || cleanTitle.toLowerCase().includes('study') || cleanTitle.toLowerCase().includes('manual') || cleanTitle.toLowerCase().includes('handout') || cleanTitle.toLowerCase().includes('notes') || cleanTitle.toLowerCase().includes('syllabus');

  if (isGuide) {
    return {
      title: cleanTitle,
      fileName: doc.fileName,
      fileType: 'pdf',
      author,
      course,
      date,
      fileSize: doc.fileSize || '420 KB',
      wordCount: 1680,
      pageCount: 3,
      sections: [
        {
          heading: 'Course Study Guide & Overview',
          paragraphs: [
            'This instructor-prepared guide synthesizes fundamental theoretical principles, core mathematical theorems, and practical laboratory techniques required for upcoming deliverables and examinations.',
            'Students should review each topic thoroughly and work through the sample exercises prior to attending recitation sessions.'
          ],
          callout: 'Study Recommendation: Focus on foundational derivations and master the step-by-step transformation techniques outlined in Section 2.'
        },
        {
          heading: 'Core Conceptual Pillars & Algorithmic Summary',
          paragraphs: [
            'The following structured table summarizes the key principles, invariant properties, and algorithmic bounds pertinent to this module:'
          ],
          table: {
            headers: ['Module Topic', 'Key Principle / Formula', 'Runtime Bound', 'Common Pitfalls', 'Mastery Level'],
            rows: [
              ['Tree Rebalancing', 'Left/Right Rotations preserve BST search property', 'O(log n) worst-case', 'Forgetting parent pointer fixups', 'Essential'],
              ['Recurrence Equations', 'T(n) = aT(n/b) + f(n) (Master Method)', 'Θ(n^(log_b a))', 'Comparing f(n) with critical exponent', 'Advanced'],
              ['Matrix Operations', 'Orthogonal projection onto column subspace', 'O(n³) standard', 'Non-invertible singular matrices', 'Core Skill'],
              ['Normalization', 'Bodd-Codd (BCNF) & Third Normal Form (3NF)', 'Functional dependencies', 'Lossy decomposition / dependencies', 'High Priority']
            ]
          }
        },
        {
          heading: 'Worked Practice Problems & Step-by-Step Solutions',
          paragraphs: [
            'Problem 1: Derive the closed-form recurrence solution for T(n) = 2T(n/2) + n log n. Solution: Since a=2, b=2, log_b(a)=1, f(n) = n log n falls into Master Theorem Case 2 extension, yielding T(n) = Θ(n log² n).',
            'Problem 2: Verify whether a given 3x3 matrix has full rank. Solution: Compute the determinant |A|. If |A| ≠ 0, rank equals 3 and the kernel is the trivial zero vector.'
          ]
        },
        {
          heading: 'Faculty Instructor Remarks & Exam Guidance',
          paragraphs: [
            'Exams are closed-book. Students are permitted one double-sided letter-sized reference sheet. Formulas from this guide may be cited directly without re-derivation on homework assignments.'
          ]
        }
      ]
    };
  }

  // Default PDF Document content generator
  return {
    title: cleanTitle,
    fileName: doc.fileName,
    fileType: 'pdf',
    author,
    course,
    date,
    fileSize: doc.fileSize || '480 KB',
    wordCount: 1420,
    pageCount: 3,
    sections: [
      {
        heading: 'Abstract & Background Overview',
        paragraphs: [
          'This formal academic submission presents comprehensive solutions, verified algorithmic proofs, and empirical evaluations for the assigned curriculum milestone.',
          'Key subjects covered include asymptotic analysis using the Master Theorem, recurrence tree visualizations, and closed-form inductive verification.'
        ],
        callout: 'Theorem 1.1: Let T(n) = aT(n/b) + f(n). When f(n) = Θ(n^(log_b a) * log^k n), then T(n) = Θ(n^(log_b a) * log^(k+1) n).'
      },
      {
        heading: 'Analytical Derivations & Proof Steps',
        paragraphs: [
          'Step 1: Expand recurrence relation level-by-level across tree height h = log_b(n).',
          'Step 2: Aggregate computational work at depth i, accounting for branch branching factor a^i.',
          'Step 3: Sum the finite geometric series across all levels to derive the exact upper bound.'
        ],
        table: {
          headers: ['Level i', 'Subproblem Size', 'Number of Nodes', 'Work per Node', 'Total Level Cost'],
          rows: [
            ['Level 0 (Root)', 'n', '1', 'f(n)', 'cn²'],
            ['Level 1', 'n / 2', '2', 'c(n/2)²', '½ cn²'],
            ['Level 2', 'n / 4', '4', 'c(n/4)²', '¼ cn²'],
            ['Level h (Leaves)', '1', 'n^(log₂ a)', 'Θ(1)', 'Θ(n)']
          ]
        }
      },
      {
        heading: 'Experimental Verification & Observations',
        paragraphs: [
          'Synthesized runtime simulations in C++20 using high-resolution monotonic clocks align with the derived Θ(n log n) bound within 1.2% experimental variance.',
          'All unit tests have passed grading criteria with 100% branch coverage.'
        ]
      }
    ]
  };
}

export function downloadDocumentFile(doc: DocumentItem): void {
  const fileName = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.${doc.fileType === 'excel' ? 'xlsx' : doc.fileType === 'word' ? 'docx' : 'pdf'}`;

  // If there's an actual data URL (e.g. data:application/pdf;base64...)
  if (doc.fileData && doc.fileData.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Generate downloadable formatted text/csv blob
  const model = generateAcademicDocumentContent(doc);
  let blobContent = '';
  let mimeType = 'text/plain';

  if (model.fileType === 'excel') {
    mimeType = 'text/csv;charset=utf-8;';
    const activeSheet = model.sheets?.[0];
    if (activeSheet) {
      blobContent += activeSheet.columns.join(',') + '\n';
      activeSheet.rows.forEach(r => {
        blobContent += r.map(c => `"${typeof c === 'object' && c !== null ? (c as any).value : c}"`).join(',') + '\n';
      });
    }
  } else {
    mimeType = 'text/plain;charset=utf-8;';
    blobContent = `========================================================================\n`
      + `${model.title.toUpperCase()}\n`
      + `Course: ${model.course}\n`
      + `Author: ${model.author}\n`
      + `Date: ${model.date}\n`
      + `========================================================================\n\n`;

    model.sections.forEach(sec => {
      blobContent += `[ ${sec.heading} ]\n\n`;
      sec.paragraphs.forEach(p => {
        blobContent += `${p}\n\n`;
      });
      if (sec.callout) {
        blobContent += `NOTE: ${sec.callout}\n\n`;
      }
      if (sec.table) {
        blobContent += sec.table.headers.join(' | ') + '\n';
        blobContent += sec.table.headers.map(() => '---').join(' | ') + '\n';
        sec.table.rows.forEach(r => {
          blobContent += r.join(' | ') + '\n';
        });
        blobContent += '\n';
      }
    });
  }

  const blob = new Blob([blobContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.csv') || fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
