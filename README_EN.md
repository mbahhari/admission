# Admission System - Student Ranking System

## 📋 Project Description

A sophisticated web system for ranking university admission applicants based on specific criteria, with priority support for industrial high school graduates.

## ✨ Key Features

### 🏭 Smart Priority System
- **Industrial High School Priority**: Applicants with GPA from 5 get priority
- **Fair Evaluation**: Each school type is evaluated appropriately
- **Smart Ranking**: Industrial high school first, then general high school

### 📊 Evaluation Criteria
- **High School GPA**: 50%
- **Achievement Test Score**: 20%
- **Aptitude Test Score**: 30%

### 🔍 Advanced Filtering
- **Graduation Year Filter**: Select one or multiple years
- **Multi-Year Selection**: Support for selecting multiple years at once
- **Special Rule**: Industrial high school students always appear regardless of graduation year
- **Real-time Statistics**: Display filtered applicant count

### 📁 Data Management
- **Excel File Upload**: Support for .xlsx and .xls formats
- **Separate Tables**: Display industrial and general high school students in separate tables
- **Results Export**: Export selected candidates to Excel file
- **Smart Formatting**: Clear data display with school type distinction

## 🚀 Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Data Processing**: SheetJS (xlsx)
- **Design**: Responsive Design, Modern UI/UX
- **Language**: Arabic with RTL support

## 📥 System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required
- Works directly from the browser

## 🎯 How to Use

### 1. Upload Excel File
- Click "Choose Excel File"
- Select file containing applicant data
- Ensure required columns are present

### 2. Evaluation Criteria
- **High School GPA**: Column containing GPA (from 100 or from 5)
- **Achievement Test**: Column containing test score
- **Aptitude Test**: Column containing test score

### 3. Filter Results
- Select graduation year
- Specify number of candidates needed
- Use multi-year filtering

### 4. Export Results
- Click "Export Candidates to Excel"
- Save file in desired location

## 📊 Excel File Format

### Required Columns:
1. **Applicant Name**: Column containing applicant names
2. **High School GPA**: Column containing cumulative GPA
3. **Achievement Test**: Column containing test score
4. **Aptitude Test**: Column containing test score

### Optional Columns:
5. **Graduation Year**: Column containing high school graduation year

### Data Example:
```
| Applicant Name | High School GPA | Achievement Test | Aptitude Test | Graduation Year |
|----------------|-----------------|------------------|---------------|-----------------|
| Ahmed Mohamed | 95              | 85               | 90            | 2023            |
| Fatima Ali    | 4.2             | 78               | 82            | 2022            |
```

## 🔧 Evaluation Mechanism

### For Industrial High School (GPA from 5):
- Convert GPA to percentage: `(GPA ÷ 5) × 100`
- Sort descending by converted GPA
- Other criteria not applied
- **Absolute Priority**: Always appear in results regardless of graduation year

### For General High School (GPA from 100):
- Calculate weighted score: `(GPA × 0.5) + (Achievement × 0.2) + (Aptitude × 0.3)`
- Sort descending by weighted score
- **Year Filtering**: Only appear if their graduation year matches selected years

## 📅 Year Filtering Rules

### When selecting "All Years":
- **All applicants** appear (industrial and general)

### When selecting specific years:
- **Industrial High School Students**: **Always** appear regardless of graduation year
- **General High School Students**: **Only** appear if their graduation year matches selected years

### Practical Example:
```
Selecting year 2023:
- Industrial student graduated 2022 → Appears ✅
- Industrial student graduated 2023 → Appears ✅  
- General student graduated 2023 → Appears ✅
- General student graduated 2022 → Does not appear ❌
```

## 📊 Separate Tables System

### Industrial High School Table:
- **Absolute Priority**: Always appear in results
- **No Criteria Applied**: Depends only on converted GPA
- **Converted GPA**: GPA displayed as percentage (from 100)
- **Descending Order**: By converted GPA

### General High School Table:
- **With Applied Criteria**: GPA 50% + Achievement 20% + Aptitude 30%
- **Year Filtering**: Only appear according to selected year
- **Weighted Score**: Final result displayed
- **Descending Order**: By weighted score

### Display Example:
```
Industrial High School Table (Absolute Priority):
1. Ahmed Mohamed - GPA 4.5 - Converted GPA: 90%
2. Fatima Ali - GPA 4.2 - Converted GPA: 84%

General High School Table (With Applied Criteria):
1. Khalid Ahmed - GPA 95 - Weighted Score: 87.5
2. Sara Mohamed - GPA 88 - Weighted Score: 82.4
```

## 📱 Responsive Design

- **Desktop**: Full display with all features
- **Tablet**: Optimized for medium screens
- **Mobile**: Responsive design for smartphones

## 🎨 Visual Features

- **Formal Design**: Neutral colors and professional appearance
- **School Type Distinction**: Different colors for industrial and general high schools
- **Visual Effects**: Smooth transitions and enhanced interactions

## 📈 System Statistics

- **Applicant Count**: Display total number of applicants
- **Distribution**: Statistics by school type (industrial/general)
- **Available Years**: List of all graduation years
- **Filtered Candidates**: Number of results after filtering

## 🔍 Troubleshooting

### Common Issues:
1. **Excel File Not Read**: Ensure correct file format
2. **Missing Columns**: Ensure required columns are present
3. **Invalid Data**: Ensure data is correctly entered

### Error Messages:
- "File does not contain sufficient data"
- "Required columns not found"
- "Error reading file"

## 🚀 Future Development

- [ ] CSV file support
- [ ] Customizable evaluation criteria
- [ ] PDF export support
- [ ] Charts and statistics
- [ ] User login system
- [ ] Multi-user database

## 👥 Contributing

We welcome your contributions to develop this project! You can:
- Report bugs
- Suggest new features
- Improve code
- Enhance design

## 📄 License

This project is open source and available for educational and commercial use.

## 📞 Support

For inquiries and technical support, please contact via:
- Create Issue on GitHub
- Review documentation
- Examine source code

---

**Developed by the Development Team**
**Last Update**: December 2024
