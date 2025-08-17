// متغيرات عامة
let applicantsData = [];
let sortedApplicants = [];
let filteredApplicants = [];
let availableYears = [];

// معايير التقييم
const CRITERIA_WEIGHTS = {
    highSchoolGPA: 0.50,      // معدل الثانوي التراكمي 50%
    achievementTest: 0.20,     // درجة اختبار التحصيلي 20%
    aptitudeTest: 0.30         // درجة اختبار القدرات 30%
};

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

// إعداد مستمعي الأحداث
function initializeEventListeners() {
    const fileInput = document.getElementById('excelFile');
    const exportBtn = document.getElementById('exportBtn');
    const candidateCountInput = document.getElementById('candidateCount');
    const graduationYearSelect = document.getElementById('graduationYear');

    fileInput.addEventListener('change', handleFileUpload);
    exportBtn.addEventListener('click', exportToExcel);
    candidateCountInput.addEventListener('change', updateResultsDisplay);
    graduationYearSelect.addEventListener('change', filterByGraduationYear);
}

// معالجة رفع الملف
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // تحويل البيانات إلى JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length < 2) {
                alert('الملف لا يحتوي على بيانات كافية');
                return;
            }

            // معالجة البيانات
            processExcelData(jsonData);
            
            // عرض معلومات الملف
            document.getElementById('fileInfo').textContent = 
                `تم رفع الملف: ${file.name} - عدد المتقدمين: ${applicantsData.length}`;
            
            // إضافة معلومات السنوات المتاحة
            if (availableYears.length > 0) {
                document.getElementById('fileInfo').textContent += ` - السنوات المتاحة: ${availableYears.join(', ')}`;
            }
            
            // إظهار قسم النتائج
            document.getElementById('resultsSection').style.display = 'block';
            
            // ترتيب وعرض النتائج
            sortAndDisplayApplicants();
            
        } catch (error) {
            console.error('خطأ في قراءة الملف:', error);
            alert('حدث خطأ في قراءة الملف. تأكد من أن الملف صحيح.');
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// معالجة بيانات الإكسل
function processExcelData(jsonData) {
    const headers = jsonData[0];
    applicantsData = [];
    
    // البحث عن أعمدة البيانات المطلوبة
    const columnMap = findDataColumns(headers);
    
    if (!columnMap.isValid) {
        alert('لم يتم العثور على الأعمدة المطلوبة في الملف. تأكد من أن الملف يحتوي على:\n- معدل الثانوي التراكمي\n- درجة اختبار التحصيلي\n- درجة اختبار القدرات');
        return;
    }
    
    // معالجة كل صف من البيانات
    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row.length === 0) continue;
        
        const applicant = {
            name: row[columnMap.name] || `متقدم ${i}`,
            highSchoolGPA: parseFloat(row[columnMap.highSchoolGPA]) || 0,
            achievementTest: parseFloat(row[columnMap.achievementTest]) || 0,
            aptitudeTest: parseFloat(row[columnMap.aptitudeTest]) || 0,
            graduationYear: row[columnMap.graduationYear] || '',
            originalIndex: i
        };
        
        // التحقق من صحة البيانات
        if (isValidApplicant(applicant)) {
            applicantsData.push(applicant);
        }
    }
    
    console.log('تم معالجة البيانات:', applicantsData.length, 'متقدم');
    
    // ملء قائمة السنوات المتاحة
    populateGraduationYears();
}

// البحث عن أعمدة البيانات في الملف
function findDataColumns(headers) {
    const columnMap = {
        name: -1,
        highSchoolGPA: -1,
        achievementTest: -1,
        aptitudeTest: -1,
        graduationYear: -1,
        isValid: false
    };
    
    // البحث عن الأعمدة باستخدام كلمات مفتاحية
    headers.forEach((header, index) => {
        if (!header) return;
        
        const headerStr = header.toString().toLowerCase();
        
        // اسم المتقدم
        if (headerStr.includes('اسم') || headerStr.includes('name') || headerStr.includes('الاسم')) {
            columnMap.name = index;
        }
        
        // معدل الثانوي التراكمي
        if (headerStr.includes('معدل') || headerStr.includes('ثانوي') || headerStr.includes('تراكمي') || 
            headerStr.includes('gpa') || headerStr.includes('rate')) {
            columnMap.highSchoolGPA = index;
        }
        
        // درجة اختبار التحصيلي
        if (headerStr.includes('تحصيلي') || headerStr.includes('achievement') || headerStr.includes('تحصيل')) {
            columnMap.achievementTest = index;
        }
        
        // درجة اختبار القدرات
        if (headerStr.includes('قدرات') || headerStr.includes('aptitude') || headerStr.includes('قدرة')) {
            columnMap.aptitudeTest = index;
        }
        
        // سنة التخرج من الثانوية
        if (headerStr.includes('سنة') || headerStr.includes('تخرج') || headerStr.includes('graduation') || 
            headerStr.includes('year') || headerStr.includes('تاريخ')) {
            columnMap.graduationYear = index;
        }
    });
    
    // التحقق من وجود جميع الأعمدة المطلوبة
    columnMap.isValid = columnMap.highSchoolGPA !== -1 && 
                       columnMap.achievementTest !== -1 && 
                       columnMap.aptitudeTest !== -1;
    
    // سنة التخرج اختيارية
    if (columnMap.graduationYear === -1) {
        console.log('تحذير: لم يتم العثور على عمود سنة التخرج');
    }
    
    return columnMap;
}

// ملء قائمة السنوات المتاحة
function populateGraduationYears() {
    const yearSelect = document.getElementById('graduationYear');
    const years = new Set();
    
    // جمع السنوات الفريدة من البيانات
    applicantsData.forEach(applicant => {
        if (applicant.graduationYear && applicant.graduationYear.toString().trim() !== '') {
            years.add(applicant.graduationYear.toString().trim());
        }
    });
    
    // تحويل إلى مصفوفة وترتيبها
    availableYears = Array.from(years).sort((a, b) => b - a); // ترتيب تنازلي
    
    // مسح الخيارات الحالية
    yearSelect.innerHTML = '';
    
    // إضافة خيار "جميع السنوات" كخيار افتراضي
    const allYearsOption = document.createElement('option');
    allYearsOption.value = '';
    allYearsOption.textContent = 'جميع السنوات';
    allYearsOption.selected = true; // تحديد افتراضي
    yearSelect.appendChild(allYearsOption);
    
    // إضافة السنوات المتاحة
    availableYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
    
    console.log('السنوات المتاحة:', availableYears);
}

// التحقق من صحة بيانات المتقدم
function isValidApplicant(applicant) {
    return applicant.highSchoolGPA > 0 && 
           applicant.achievementTest > 0 && 
           applicant.aptitudeTest > 0 &&
           applicant.achievementTest <= 100 &&
           applicant.aptitudeTest <= 100;
}

// تحديد نوع الثانوية (صناعية أو عامة)
function getSchoolType(applicant) {
    // إذا كان المعدل من 5 أو أقل، فهي ثانوية صناعية
    if (applicant.highSchoolGPA <= 5) {
        return 'industrial'; // صناعية
    } else {
        return 'general'; // عامة
    }
}

// تصفية المتقدمين حسب سنة التخرج
function filterByGraduationYear() {
    const yearSelect = document.getElementById('graduationYear');
    const selectedOptions = Array.from(yearSelect.selectedOptions);
    const selectedYears = selectedOptions.map(option => option.value);
    
    // إذا لم يتم اختيار أي سنة أو تم اختيار "جميع السنوات"
    if (selectedYears.length === 0 || selectedYears.includes('')) {
        // اعرض جميع المتقدمين
        filteredApplicants = [...sortedApplicants];
        console.log('تم عرض جميع المتقدمين: جميع السنوات');
        updateFilterInfo('جميع السنوات', filteredApplicants.length);
    } else {
        // تصفية حسب السنوات المختارة
        filteredApplicants = sortedApplicants.filter(applicant => 
            applicant.graduationYear && 
            selectedYears.includes(applicant.graduationYear.toString().trim())
        );
        
        console.log(`تم تصفية المتقدمين حسب السنوات ${selectedYears.join(', ')}: ${filteredApplicants.length} متقدم`);
        updateFilterInfo(selectedYears.join(', '), filteredApplicants.length);
    }
    
    // تحديث العرض
    displayResults();
}

// تحديث معلومات التصفية
function updateFilterInfo(selectedYearsText, count) {
    document.getElementById('selectedYearsInfo').textContent = selectedYearsText;
    document.getElementById('filteredCount').textContent = count;
    
    // حساب إحصائيات نوع الثانوية
    const industrialCount = filteredApplicants.filter(a => a.schoolType === 'industrial').length;
    const generalCount = filteredApplicants.filter(a => a.schoolType === 'general').length;
    
    const schoolTypeInfo = `صناعية: ${industrialCount} | عامة: ${generalCount}`;
    document.getElementById('schoolTypeInfo').textContent = schoolTypeInfo;
}

// ترتيب المتقدمين حسب المعايير
function sortApplicants() {
    // تصنيف المتقدمين حسب نوع الثانوية
    const industrialApplicants = [];
    const generalApplicants = [];
    
    applicantsData.forEach(applicant => {
        const schoolType = getSchoolType(applicant);
        
        if (schoolType === 'industrial') {
            // للثانوية الصناعية: حساب المعدل كنسبة مئوية (من 100)
            const gpaPercentage = (applicant.highSchoolGPA / 5) * 100;
            industrialApplicants.push({
                ...applicant,
                schoolType: 'industrial',
                gpaPercentage: Math.round(gpaPercentage * 100) / 100,
                weightedScore: gpaPercentage // استخدام المعدل كنسبة مئوية للترتيب
            });
        } else {
            // للثانوية العامة: حساب المجموع الموزون
            const weightedScore = 
                (applicant.highSchoolGPA * CRITERIA_WEIGHTS.highSchoolGPA) +
                (applicant.achievementTest * CRITERIA_WEIGHTS.achievementTest) +
                (applicant.aptitudeTest * CRITERIA_WEIGHTS.aptitudeTest);
            
            generalApplicants.push({
                ...applicant,
                schoolType: 'general',
                weightedScore: Math.round(weightedScore * 100) / 100
            });
        }
    });
    
    // ترتيب المتقدمين من الثانوية الصناعية تنازلياً حسب المعدل
    industrialApplicants.sort((a, b) => b.gpaPercentage - a.gpaPercentage);
    
    // ترتيب المتقدمين من الثانوية العامة تنازلياً حسب المجموع الموزون
    generalApplicants.sort((a, b) => b.weightedScore - a.weightedScore);
    
    // دمج النتائج مع إعطاء الأولوية للثانوية الصناعية
    sortedApplicants = [...industrialApplicants, ...generalApplicants];
    
    // تعيين المتقدمين المفلترين كجميع المتقدمين في البداية
    filteredApplicants = [...sortedApplicants];
    
    // تحديث معلومات التصفية
    updateFilterInfo('جميع السنوات', filteredApplicants.length);
    
    console.log(`تم ترتيب ${industrialApplicants.length} متقدم من الثانوية الصناعية و ${generalApplicants.length} متقدم من الثانوية العامة`);
}

// عرض النتائج
function displayResults() {
    const candidateCount = parseInt(document.getElementById('candidateCount').value) || 10;
    const resultsBody = document.getElementById('resultsBody');
    
    // مسح الجدول
    resultsBody.innerHTML = '';
    
    // استخدام المتقدمين المفلترين
    const applicantsToDisplay = filteredApplicants.length > 0 ? filteredApplicants : sortedApplicants;
    
    // عرض المرشحين حسب العدد المطلوب
    const displayCount = Math.min(candidateCount, applicantsToDisplay.length);
    
    for (let i = 0; i < displayCount; i++) {
        const applicant = applicantsToDisplay[i];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="rank">${i + 1}</td>
            <td>${applicant.name}</td>
            <td>${applicant.highSchoolGPA}${applicant.schoolType === 'industrial' ? ' (من 5)' : ' (من 100)'}</td>
            <td>${applicant.achievementTest}</td>
            <td>${applicant.aptitudeTest}</td>
            <td>${applicant.graduationYear || '-'}</td>
            <td class="weighted-score">${applicant.weightedScore}</td>
            <td class="school-type">${applicant.schoolType === 'industrial' ? 'صناعية' : 'عامة'}</td>
        `;
        
        resultsBody.appendChild(row);
    }
}

// ترتيب وعرض النتائج
function sortAndDisplayApplicants() {
    if (applicantsData.length === 0) return;
    
    sortApplicants();
    displayResults();
}

// تحديث عرض النتائج عند تغيير عدد المرشحين
function updateResultsDisplay() {
    if (sortedApplicants.length > 0) {
        displayResults();
    }
}

// تحديث عرض النتائج عند تغيير سنة التخرج
function updateResultsDisplayByYear() {
    if (sortedApplicants.length > 0) {
        filterByGraduationYear();
    }
}

// تصدير النتائج إلى ملف إكسل
function exportToExcel() {
    if (sortedApplicants.length === 0) {
        alert('لا توجد بيانات للتصدير');
        return;
    }
    
    const candidateCount = parseInt(document.getElementById('candidateCount').value) || 10;
    const exportCount = Math.min(candidateCount, filteredApplicants.length > 0 ? filteredApplicants.length : sortedApplicants.length);
    
    // الحصول على السنوات المختارة
    const yearSelect = document.getElementById('graduationYear');
    const selectedOptions = Array.from(yearSelect.selectedOptions);
    const selectedYears = selectedOptions.map(option => option.value);
    const selectedYearsText = selectedYears.includes('') ? 'جميع السنوات' : selectedYears.join(', ');
    
    // إنشاء بيانات التصدير
    const exportData = [];
    
    // إضافة رأس الجدول
    exportData.push([
        'الترتيب',
        'اسم المتقدم',
        'معدل الثانوي التراكمي',
        'درجة اختبار التحصيلي',
        'درجة اختبار القدرات',
        'سنة التخرج',
        'المجموع الموزون',
        'نوع الثانوية'
    ]);
    
    // إضافة بيانات المرشحين
    for (let i = 0; i < exportCount; i++) {
        const applicant = filteredApplicants[i] || sortedApplicants[i];
        exportData.push([
            i + 1,
            applicant.name,
            applicant.highSchoolGPA,
            applicant.achievementTest,
            applicant.aptitudeTest,
            applicant.graduationYear || '-',
            applicant.weightedScore,
            applicant.schoolType === 'industrial' ? 'صناعية' : 'عامة'
        ]);
    }
    
    // إضافة معلومات التصفية
    exportData.push([]); // صف فارغ
    exportData.push(['معلومات التصفية']);
    exportData.push(['السنوات المختارة:', selectedYearsText || 'جميع السنوات']);
    exportData.push(['عدد المتقدمين المصدرين:', exportCount]);
    
    // إضافة إحصائيات نوع الثانوية
    const industrialCount = filteredApplicants.filter(a => a.schoolType === 'industrial').length;
    const generalCount = filteredApplicants.filter(a => a.schoolType === 'general').length;
    exportData.push(['التوزيع حسب نوع الثانوية:']);
    exportData.push(['ثانوية صناعية:', industrialCount]);
    exportData.push(['ثانوية عامة:', generalCount]);
    
    exportData.push(['تاريخ التصدير:', new Date().toLocaleDateString('ar-SA')]);
    
    // إنشاء ورقة عمل
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    
    // تنسيق الأعمدة
    const columnWidths = [
        { wch: 8 },   // الترتيب
        { wch: 25 },  // اسم المتقدم
        { wch: 20 },  // معدل الثانوي
        { wch: 20 },  // اختبار التحصيلي
        { wch: 20 },  // اختبار القدرات
        { wch: 15 },  // سنة التخرج
        { wch: 15 },  // المجموع الموزون
        { wch: 15 }   // نوع الثانوية
    ];
    worksheet['!cols'] = columnWidths;
    
    // إنشاء ملف العمل
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المرشحون المختارون');
    
    // تصدير الملف
    const fileName = `المرشحون_المختارون_${new Date().toLocaleDateString('ar-SA')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    alert(`تم تصدير ${exportCount} مرشح إلى الملف: ${fileName}`);
}
