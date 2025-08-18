// متغيرات عامة
let applicantsData = [];
let sortedApplicants = [];
let filteredApplicants = [];
let availableYears = [];
let excludedApplicants = []; // قائمة المرشحين المستبعدين

// معايير التقييم
const CRITERIA_WEIGHTS = {
    highSchoolGPA: 0.50,      // معدل الثانوي التراكمي 50%
    achievementTest: 0.20,     // درجة اختبار التحصيلي 20%
    aptitudeTest: 0.30         // درجة اختبار القدرات 30%
};

// وزن سنة التخرج (يُضاف إلى المجموع الموزون لطلاب الثانوية العامة)
const GRADUATION_YEAR_WEIGHT = 0.50; // سنة التخرج 50%

// تحويل الأرقام العربية-الهندية إلى إنجليزية
function convertArabicDigitsToEnglish(input) {
    if (input == null) return '';
    const str = input.toString();
    const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
    const easternArabicIndic = '۰۱۲۳۴۵۶۷۸۹';
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        const idx1 = arabicIndic.indexOf(ch);
        if (idx1 !== -1) {
            result += idx1.toString();
            continue;
        }
        const idx2 = easternArabicIndic.indexOf(ch);
        if (idx2 !== -1) {
            result += idx2.toString();
            continue;
        }
        result += ch;
    }
    return result;
}

// الحصول على السنة الهجرية الحالية
function getCurrentHijriYear() {
    try {
        const parts = new Intl.DateTimeFormat('en-u-ca-islamic', { year: 'numeric' }).formatToParts(new Date());
        const yearPart = parts.find(p => p.type === 'year');
        const yearNum = yearPart ? parseInt(yearPart.value, 10) : NaN;
        if (!isNaN(yearNum)) return yearNum;
    } catch (e) {
        // تجاهل: قد لا يدعم المتصفح تقويم Islamic
    }
    // احتياطي تقريبي
    return Math.round(new Date().getFullYear() - 578);
}

// تحويل سنة هجرية إلى سنة ميلادية مكافئة (تقريبية)
function hijriToGregorianYear(hijriYear) {
    if (!hijriYear) return null;
    // لضمان توافق الأمثلة: 1447 -> 2025، 1446 -> 2024
    return hijriYear + 578;
}

// تحويل تاريخ هجري تقريبي إلى ميلادي (باستخدام نفس اليوم/الشهر مع إزاحة سنة)
function hijriToGregorianDateApprox(hDay, hMonth, hYear) {
    const gYear = hijriToGregorianYear(hYear);
    if (!gYear) return null;
    const monthIndex = Math.max(0, Math.min(11, (hMonth || 1) - 1));
    const dayValue = Math.max(1, Math.min(28, hDay || 1));
    try {
        return new Date(gYear, monthIndex, dayValue);
    } catch (e) {
        return null;
    }
}

// تحليل تاريخ هجري بصيغة dd/mm/yyyy (يدعم الأرقام العربية)
function parseHijriDmyString(raw) {
    if (!raw) return { day: null, month: null, year: null };
    const normalized = convertArabicDigitsToEnglish(raw).trim();
    const parts = normalized.split(/[\/-]/);
    if (parts.length !== 3) return { day: null, month: null, year: null };
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return { day: null, month: null, year: null };
    return { day, month, year };
}

// استخراج سنة مكونة من 4 خانات من نص ما (بعد تحويل الأرقام العربية)
function extractFourDigitYearFromString(raw) {
    if (!raw) return null;
    const normalized = convertArabicDigitsToEnglish(raw).trim();
    const match = normalized.match(/(\d{4})/);
    if (!match) return null;
    const year = parseInt(match[1], 10);
    if (isNaN(year)) return null;
    return year;
}

// حساب العمر بالسنوات من تاريخ ميلادي
function computeAgeYearsFromGregorianDate(gregDate) {
    if (!gregDate) return null;
    const today = new Date();
    let age = today.getFullYear() - gregDate.getFullYear();
    const m = today.getMonth() - gregDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < gregDate.getDate())) {
        age--;
    }
    return age;
}

// استخراج سنة رقمية ونوع التقويم من نص سنة التخرج
function parseGraduationYear(rawValue) {
    if (rawValue == null) return { year: null, calendar: null };
    const normalized = convertArabicDigitsToEnglish(rawValue).trim();
    const match = normalized.match(/(\d{4})/);
    if (!match) return { year: null, calendar: null };
    const year = parseInt(match[1], 10);
    // تحديد نوع التقويم بناءً على المجال
    if (year >= 1300 && year <= 1600) {
        return { year, calendar: 'hijri' };
    }
    if (year >= 1900 && year <= 2100) {
        return { year, calendar: 'gregorian' };
    }
    return { year: null, calendar: null };
}

// حساب درجة سنة التخرج (100/90/80/70/60/50) وفارق السنوات بناءً على السنة الميلادية المكافئة
function computeGraduationYearScore(year, calendar) {
    if (!year || !calendar) return { diffYears: null, score: 0 };
    const currentGregorian = new Date().getFullYear();
    let normalizedGradYear = year;
    if (calendar === 'hijri') {
        normalizedGradYear = hijriToGregorianYear(year);
    }
    let diff = currentGregorian - (normalizedGradYear || 0);
    if (diff < 0) diff = 0;
    let score = 0;
    // خريج السنة الحالية = 100، الأولى = 90 ... الخامسة = 50
    if (diff === 0) score = 100;
    else if (diff === 1) score = 90;
    else if (diff === 2) score = 80;
    else if (diff === 3) score = 70;
    else if (diff === 4) score = 60;
    else if (diff === 5) score = 50;
    else score = 0; // أكبر من 5 سنوات
    return { diffYears: diff, score };
}

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
            
            console.log(`تم رفع الملف: ${file.name}`);
            console.log(`عدد المتقدمين المقبولين: ${applicantsData.length}`);
            console.log(`السنوات المتاحة: ${availableYears.join(', ')}`);
            
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
    excludedApplicants = []; // إعادة تعيين المستبعدين عند معالجة ملف جديد
    
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
        const rawGraduationYear = columnMap.graduationYear !== -1 ? row[columnMap.graduationYear] : '';
        const { year: gradYearNumeric, calendar: gradCalendar } = parseGraduationYear(rawGraduationYear);
        const normalizedGregorianYear = gradCalendar === 'hijri' ? hijriToGregorianYear(gradYearNumeric) : gradYearNumeric;
        const { diffYears: gradYearDiff, score: gradYearScore } = computeGraduationYearScore(gradYearNumeric, gradCalendar);
        const autoExcludedByYear = gradYearDiff != null && gradYearDiff > 5;

        // تاريخ الميلاد الهجري - نحتفظ فقط بسنة من 4 خانات
        const rawBirthHijri = (columnMap.birthHijri !== undefined && columnMap.birthHijri !== -1) ? row[columnMap.birthHijri] : '';
        let birthHYear = null;
        // محاولة قراءة dd/mm/yyyy أولاً
        const parsedHijriDmy = parseHijriDmyString(rawBirthHijri || '');
        if (parsedHijriDmy.year && String(parsedHijriDmy.year).length === 4) {
            birthHYear = parsedHijriDmy.year;
        } else {
            // وإلا نستخرج أي سنة من 4 خانات من النص
            const yearOnly = extractFourDigitYearFromString(rawBirthHijri || '');
            if (yearOnly && String(yearOnly).length === 4) {
                birthHYear = yearOnly;
            }
        }
        const birthGregorianDate = (birthHYear) ? hijriToGregorianDateApprox(1, 1, birthHYear) : null;
        const ageYears = birthGregorianDate ? computeAgeYearsFromGregorianDate(birthGregorianDate) : null;
        const autoExcludedByAge = ageYears != null && ageYears > 25;

        const applicant = {
            name: row[columnMap.name] || `متقدم ${i}`,
            highSchoolGPA: parseFloat(row[columnMap.highSchoolGPA]) || 0,
            achievementTest: parseFloat(row[columnMap.achievementTest]) || 0,
            aptitudeTest: parseFloat(row[columnMap.aptitudeTest]) || 0,
            graduationYear: rawGraduationYear || '',
            graduationYearNumeric: gradYearNumeric || null,
            graduationCalendar: gradCalendar || null,
            graduationYearNormalized: normalizedGregorianYear || null,
            graduationYearDiff: gradYearDiff,
            graduationYearScore: gradYearScore,
            excludedByYear: autoExcludedByYear,
            birthHijri: birthHYear || '',
            birthGregorianDate: birthGregorianDate,
            ageYears: ageYears,
            excludedByAge25: autoExcludedByAge,
            originalIndex: i
        };
        
        // طباعة معلومات المتقدم للتصحيح
        console.log(`المتقدم ${i}:`, {
            name: applicant.name,
            gpa: applicant.highSchoolGPA,
            achievement: applicant.achievementTest,
            aptitude: applicant.aptitudeTest,
            schoolType: getSchoolType(applicant),
            gradYear: applicant.graduationYear,
            gradYearNumeric: applicant.graduationYearNumeric,
            gradCalendar: applicant.graduationCalendar,
            gradYearNormalized: applicant.graduationYearNormalized,
            gradDiff: applicant.graduationYearDiff,
            gradScore: applicant.graduationYearScore,
            birthHijri: applicant.birthHijri,
            birthGregorian: applicant.birthGregorianDate,
            ageYears: applicant.ageYears,
            excludedByAge25: applicant.excludedByAge25,
            excludedByYear: applicant.excludedByYear,
            isValid: isValidApplicant(applicant)
        });
        
        // التحقق من صحة البيانات مع تطبيق قاعدة الاستبعاد (>5 سنوات)
        if (isValidApplicant(applicant)) {
            applicantsData.push(applicant);
        } else {
            console.log(`تم رفض المتقدم ${i}: ${applicant.name} - المعدل: ${applicant.highSchoolGPA}`);
            const reasons = [];
            if (applicant.excludedByYear) reasons.push('سنة التخرج أقدم من 5 سنوات');
            if (applicant.excludedByAge25) reasons.push('العمر أكبر من 25 سنة');
            if (reasons.length > 0) {
                excludedApplicants.push({
                    ...applicant,
                    schoolType: getSchoolType(applicant) === 'industrial' ? 'industrial' : 'general',
                    excludedAt: new Date(),
                    excludedReason: `تم الاستبعاد تلقائياً: ${reasons.join(' و ')}`
                });
            }
        }
    }
    
    console.log('تم معالجة البيانات:', applicantsData.length, 'متقدم');
    console.log('تفاصيل المتقدمين المقبولين:', applicantsData.map(a => ({
        name: a.name,
        gpa: a.highSchoolGPA,
        achievement: a.achievementTest,
        aptitude: a.aptitudeTest,
        year: a.graduationYear,
        birth: a.birthHijri,
        age: a.ageYears
    })));
    
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
        birthHijri: -1,
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

        // تاريخ الميلاد (هجري)
        if (
            headerStr.includes('ميلاد') ||
            headerStr.includes('تاريخ الميلاد') ||
            headerStr.includes('birth') ||
            headerStr.includes('dob')
        ) {
            columnMap.birthHijri = index;
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
    
    console.log('خريطة الأعمدة:', columnMap);
    console.log('الأعمدة المطلوبة موجودة:', columnMap.isValid);
    
    return columnMap;
}

// ملء قائمة السنوات المتاحة
function populateGraduationYears() {
    const yearSelect = document.getElementById('graduationYear');
    const years = new Set();
    
    // جمع السنوات الفريدة من البيانات
    applicantsData.forEach(applicant => {
        if (applicant.graduationYearNormalized != null) {
            years.add(String(applicant.graduationYearNormalized));
        } else if (applicant.graduationYear && applicant.graduationYear.toString().trim() !== '') {
            years.add(convertArabicDigitsToEnglish(applicant.graduationYear.toString().trim()));
        }
    });
    
    // تحويل إلى مصفوفة وترتيبها
    availableYears = Array.from(years).sort((a, b) => parseInt(b, 10) - parseInt(a, 10)); // ترتيب تنازلي
    
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
    // التحقق من وجود المعدل
    if (applicant.highSchoolGPA <= 0) {
        console.log(`رفض ${applicant.name}: المعدل صفر أو أقل`);
        return false;
    }
    
    // استبعاد إذا تجاوزت سنة التخرج 5 سنوات (إن وُجدت)
    if (applicant.excludedByYear) {
        console.log(`رفض ${applicant.name}: سنة التخرج (${applicant.graduationYear}) أقدم من 5 سنوات`);
        return false;
    }

    // استبعاد إذا كان العمر أكبر من 25 سنة (إن وُجد)
    if (applicant.excludedByAge25) {
        console.log(`رفض ${applicant.name}: العمر (${applicant.ageYears}) أكبر من 25 سنة`);
        return false;
    }

    // تحديد نوع الثانوية
    const schoolType = getSchoolType(applicant);
    
    if (schoolType === 'industrial') {
        // للثانوية الصناعية: المعدل يجب أن يكون من 1 إلى 5
        const isValid = applicant.highSchoolGPA >= 1 && applicant.highSchoolGPA <= 5;
        console.log(`الثانوية الصناعية ${applicant.name}: المعدل ${applicant.highSchoolGPA} - صالح: ${isValid}`);
        return isValid;
    } else {
        // للثانوية العامة: جميع الدرجات مطلوبة
        const isValid = applicant.achievementTest > 0 && 
                       applicant.aptitudeTest > 0 &&
                       applicant.achievementTest <= 100 &&
                       applicant.aptitudeTest <= 100;
        console.log(`الثانوية العامة ${applicant.name}: التحصيلي ${applicant.achievementTest}, القدرات ${applicant.aptitudeTest} - صالح: ${isValid}`);
        return isValid;
    }
}

// تحديد نوع الثانوية (صناعية أو عامة)
function getSchoolType(applicant) {
    // إذا كان المعدل من 5 أو أقل، فهي ثانوية صناعية
    if (applicant.highSchoolGPA <= 5) {
        console.log(`المتقدم ${applicant.name}: معدل ${applicant.highSchoolGPA} - ثانوية صناعية`);
        return 'industrial'; // صناعية
    } else {
        console.log(`المتقدم ${applicant.name}: معدل ${applicant.highSchoolGPA} - ثانوية عامة`);
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
        // تصفية المتقدمين: كلا النوعين يجب أن يطابق سنة التخرج المحددة
        filteredApplicants = sortedApplicants.filter(applicant => {
            const yearValue = applicant.graduationYearNormalized != null
                ? String(applicant.graduationYearNormalized)
                : (applicant.graduationYear ? convertArabicDigitsToEnglish(applicant.graduationYear.toString().trim()) : '');
            const matchesYear = yearValue && selectedYears.includes(yearValue);
            console.log(`تصفية حسب السنة: ${applicant.name} - النوع: ${applicant.schoolType} - السنة: ${applicant.graduationYear} (معياري: ${yearValue}) - مطابق: ${matchesYear}`);
            return matchesYear;
        });
        
        const industrialCount = filteredApplicants.filter(a => a.schoolType === 'industrial').length;
        const generalCount = filteredApplicants.filter(a => a.schoolType === 'general').length;
        
        console.log(`تم تصفية المتقدمين: الثانوية الصناعية تظهر دائماً (${industrialCount})، الثانوية العامة حسب السنوات ${selectedYears.join(', ')} (${generalCount})`);
        console.log('تفاصيل التصفية:', {
            total: filteredApplicants.length,
            industrial: industrialCount,
            general: generalCount,
            selectedYears: selectedYears
        });
        
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
    
    let schoolTypeInfo = `صناعية: ${industrialCount} | عامة: ${generalCount}`;
    
    // إضافة معلومات عن الجداول المنفصلة
    schoolTypeInfo += ` | الجداول: منفصلة`;
    
    // إضافة معلومات عن آلية العرض
    const candidateCount = parseInt(document.getElementById('candidateCount').value) || 10;
    const remainingSlots = Math.max(0, candidateCount - industrialCount);
    schoolTypeInfo += ` | العرض: ${Math.min(industrialCount, candidateCount)} صناعية + ${Math.min(remainingSlots, generalCount)} عامة`;
    
    // إضافة معلومات عن المرشحين المستبعدين
    if (excludedApplicants.length > 0) {
        schoolTypeInfo += ` | مستبعدون: ${excludedApplicants.length}`;
    }
    
    document.getElementById('schoolTypeInfo').textContent = schoolTypeInfo;
    
    console.log(`تم تحديث معلومات التصفية: ${selectedYearsText} - إجمالي: ${count} - صناعية: ${industrialCount} - عامة: ${generalCount}`);
    console.log(`آلية العرض: عدد مطلوب ${candidateCount}, أماكن متبقية ${remainingSlots}`);
    console.log(`المرشحون المستبعدون: ${excludedApplicants.length}`);
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
            const industrialApplicant = {
                ...applicant,
                schoolType: 'industrial',
                gpaPercentage: Math.round(gpaPercentage * 100) / 100,
                weightedScore: gpaPercentage // استخدام المعدل كنسبة مئوية للترتيب داخل الصناعي
            };
            industrialApplicants.push(industrialApplicant);
            console.log(`إضافة طالب ثانوية صناعية: ${applicant.name} - المعدل: ${applicant.highSchoolGPA} - النسبة: ${industrialApplicant.gpaPercentage}%`);
        } else {
            // للثانوية العامة: حساب المجموع الموزون
            const weightedScore = 
                (applicant.highSchoolGPA * CRITERIA_WEIGHTS.highSchoolGPA) +
                (applicant.achievementTest * CRITERIA_WEIGHTS.achievementTest) +
                (applicant.aptitudeTest * CRITERIA_WEIGHTS.aptitudeTest) +
                ((applicant.graduationYearScore || 0) * GRADUATION_YEAR_WEIGHT);
            
            const generalApplicant = {
                ...applicant,
                schoolType: 'general',
                weightedScore: Math.round(weightedScore * 100) / 100
            };
            generalApplicants.push(generalApplicant);
            console.log(`إضافة طالب ثانوية عامة: ${applicant.name} - المعدل: ${applicant.highSchoolGPA} - المجموع: ${generalApplicant.weightedScore}`);
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
    console.log('تفاصيل طلاب الثانوية الصناعية:', industrialApplicants.map(a => ({name: a.name, gpa: a.highSchoolGPA, percentage: a.gpaPercentage})));
    console.log('تفاصيل طلاب الثانوية العامة:', generalApplicants.map(a => ({name: a.name, gpa: a.highSchoolGPA, weighted: a.weightedScore})));
}

// عرض النتائج
function displayResults() {
    const candidateCount = parseInt(document.getElementById('candidateCount').value) || 10;
    
    console.log('بدء عرض النتائج...');
    console.log(`عدد المرشحين المطلوب: ${candidateCount}`);
    console.log(`إجمالي المتقدمين المفلترين: ${filteredApplicants.length}`);
    
    // عرض طلاب الثانوية الصناعية (أولوية مطلقة)
    const industrialCount = displayIndustrialResults(candidateCount);
    
    // عرض طلاب الثانوية العامة (مع تطبيق المعايير) - إكمال العدد المطلوب
    const totalDisplayed = displayGeneralResults(candidateCount, industrialCount);
    
    // عرض المرشحين المستبعدين
    displayExcludedCandidates();
    
    console.log(`إجمالي المرشحين المعروضين: ${totalDisplayed} (صناعية: ${industrialCount}, عامة: ${totalDisplayed - industrialCount})`);
    console.log('تم الانتهاء من عرض النتائج');
}

// عرض نتائج طلاب الثانوية الصناعية
function displayIndustrialResults(candidateCount) {
    const industrialBody = document.getElementById('industrialBody');
    industrialBody.innerHTML = '';
    
    // تصفية طلاب الثانوية الصناعية
    const industrialApplicants = filteredApplicants.filter(a => a.schoolType === 'industrial');
    
    console.log(`عرض طلاب الثانوية الصناعية: ${industrialApplicants.length} متقدم`);
    console.log('تفاصيل طلاب الثانوية الصناعية:', industrialApplicants.map(a => ({name: a.name, gpa: a.highSchoolGPA, percentage: a.gpaPercentage})));
    
    // عرض جميع طلاب الثانوية الصناعية (أولوية مطلقة)
    const displayCount = industrialApplicants.length;
    
    for (let i = 0; i < displayCount; i++) {
        const applicant = industrialApplicants[i];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="rank">${i + 1}</td>
            <td>${applicant.name}</td>
            <td>${applicant.highSchoolGPA} (من 5)</td>
            <td>${applicant.achievementTest}</td>
            <td>${applicant.aptitudeTest}</td>
            <td>${(applicant.graduationYearNormalized != null ? applicant.graduationYearNormalized : (applicant.graduationYear || '-'))}</td>
            <td>${applicant.birthHijri || '-'}</td>
            <td class="weighted-score">${applicant.gpaPercentage}%</td>
            <td>
                <button class="exclude-btn" onclick="excludeCandidate(${applicant.originalIndex}, 'industrial')" title="استبعاد المرشح">
                    استبعاد
                </button>
            </td>
        `;
        
        industrialBody.appendChild(row);
    }
    
    // إظهار أو إخفاء الجدول حسب وجود بيانات
    const industrialSection = document.querySelector('.results-section-industrial');
    if (industrialApplicants.length === 0) {
        industrialSection.style.display = 'none';
        console.log('تم إخفاء جدول الثانوية الصناعية - لا توجد بيانات');
    } else {
        industrialSection.style.display = 'block';
        console.log(`تم عرض جدول الثانوية الصناعية مع ${industrialApplicants.length} متقدم`);
    }
    
    // إرجاع عدد طلاب الثانوية الصناعية المعروضين
    return displayCount;
}

// عرض نتائج طلاب الثانوية العامة
function displayGeneralResults(candidateCount, industrialCount = 0) {
    const generalBody = document.getElementById('generalBody');
    generalBody.innerHTML = '';
    
    // تصفية طلاب الثانوية العامة
    const generalApplicants = filteredApplicants.filter(a => a.schoolType === 'general');
    
    console.log(`عرض طلاب الثانوية العامة: ${generalApplicants.length} متقدم`);
    console.log('تفاصيل طلاب الثانوية العامة:', generalApplicants.map(a => ({name: a.name, gpa: a.highSchoolGPA, weighted: a.weightedScore})));
    
    // حساب عدد المرشحين المتبقيين بعد طلاب الثانوية الصناعية
    const remainingSlots = Math.max(0, candidateCount - industrialCount);
    const displayCount = Math.min(remainingSlots, generalApplicants.length);
    
    console.log(`عدد المرشحين المطلوب: ${candidateCount}, طلاب صناعية: ${industrialCount}, أماكن متبقية: ${remainingSlots}, عرض عام: ${displayCount}`);
    
    for (let i = 0; i < displayCount; i++) {
        const applicant = generalApplicants[i];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="rank">${industrialCount + i + 1}</td>
            <td>${applicant.name}</td>
            <td>${applicant.highSchoolGPA} (من 100)</td>
            <td>${applicant.achievementTest}</td>
            <td>${applicant.aptitudeTest}</td>
            <td>${(applicant.graduationYearNormalized != null ? applicant.graduationYearNormalized : (applicant.graduationYear || '-'))}</td>
            <td>${applicant.birthHijri || '-'}</td>
            <td class="weighted-score">${applicant.weightedScore}</td>
            <td>
                <button class="exclude-btn" onclick="excludeCandidate(${applicant.originalIndex}, 'general')" title="استبعاد المرشح">
                    استبعاد
                </button>
            </td>
        `;
        
        generalBody.appendChild(row);
    }
    
    // إظهار أو إخفاء الجدول حسب وجود بيانات
    const generalSection = document.querySelector('.results-section-general');
    if (generalApplicants.length === 0 || displayCount === 0) {
        generalSection.style.display = 'none';
        console.log('تم إخفاء جدول الثانوية العامة - لا توجد بيانات أو أماكن متبقية');
    } else {
        generalSection.style.display = 'block';
        console.log(`تم عرض جدول الثانوية العامة مع ${displayCount} متقدم`);
    }
    
    // إرجاع إجمالي عدد المرشحين المعروضين
    return industrialCount + displayCount;
}

// ترتيب وعرض النتائج
function sortAndDisplayApplicants() {
    if (applicantsData.length === 0) {
        console.log('لا توجد بيانات للمتقدمين');
        return;
    }
    
    console.log('بدء ترتيب وعرض النتائج...');
    console.log(`عدد المتقدمين: ${applicantsData.length}`);
    
    sortApplicants();
    displayResults();
    
    console.log('تم الانتهاء من ترتيب وعرض النتائج');
}

// تحديث عرض النتائج عند تغيير عدد المرشحين
function updateResultsDisplay() {
    if (sortedApplicants.length > 0) {
        console.log('تحديث عرض النتائج عند تغيير عدد المرشحين...');
        displayResults();
    } else {
        console.log('لا توجد بيانات مرتبة لتحديث العرض');
    }
}

// تحديث عرض النتائج عند تغيير سنة التخرج
function updateResultsDisplayByYear() {
    if (sortedApplicants.length > 0) {
        console.log('تحديث عرض النتائج عند تغيير سنة التخرج...');
        filterByGraduationYear();
    } else {
        console.log('لا توجد بيانات مرتبة لتحديث العرض حسب السنة');
    }
}

// استبعاد مرشح وإضافة مرشح جديد
function excludeCandidate(applicantId, schoolType) {
    console.log(`محاولة استبعاد المرشح: ${applicantId} من نوع: ${schoolType}`);
    
    // البحث عن المرشح في القائمة المناسبة
    let candidateList = schoolType === 'industrial' ? 
        filteredApplicants.filter(a => a.schoolType === 'industrial') :
        filteredApplicants.filter(a => a.schoolType === 'general');
    
    const candidateIndex = candidateList.findIndex(a => a.originalIndex === applicantId);
    
    if (candidateIndex === -1) {
        console.log('لم يتم العثور على المرشح للاستبعاد');
        return;
    }
    
    const candidateToExclude = candidateList[candidateIndex];
    
    // إضافة المرشح إلى قائمة المستبعدين
    excludedApplicants.push({
        ...candidateToExclude,
        excludedAt: new Date(),
        excludedReason: 'استبعاد يدوي'
    });
    
    console.log(`تم استبعاد المرشح: ${candidateToExclude.name}`);
    
    // إزالة المرشح من القائمة المفلترة
    const globalIndex = filteredApplicants.findIndex(a => a.originalIndex === applicantId);
    if (globalIndex !== -1) {
        filteredApplicants.splice(globalIndex, 1);
        console.log(`تم إزالة المرشح من القائمة المفلترة`);
    }
    
    // إعادة عرض النتائج مع إضافة مرشحين جدد
    refreshResultsAfterExclusion();
}

// إعادة عرض النتائج بعد الاستبعاد
function refreshResultsAfterExclusion() {
    console.log('إعادة عرض النتائج بعد الاستبعاد...');
    
    // إعادة ترتيب المتقدمين مع استبعاد المستبعدين
    const availableApplicants = sortedApplicants.filter(applicant => 
        !excludedApplicants.some(excluded => excluded.originalIndex === applicant.originalIndex)
    );
    
    // إعادة تطبيق التصفية حسب السنة
    const yearSelect = document.getElementById('graduationYear');
    const selectedOptions = Array.from(yearSelect.selectedOptions);
    const selectedYears = selectedOptions.map(option => option.value);
    
    if (selectedYears.length === 0 || selectedYears.includes('')) {
        // عرض جميع المتقدمين المتاحين
        filteredApplicants = [...availableApplicants];
    } else {
        // تصفية المتقدمين: كلا النوعين يجب أن يطابق سنة التخرج المحددة
        filteredApplicants = availableApplicants.filter(applicant => {
            const yearValue = applicant.graduationYearNormalized != null
                ? String(applicant.graduationYearNormalized)
                : (applicant.graduationYear ? convertArabicDigitsToEnglish(applicant.graduationYear.toString().trim()) : '');
            return yearValue && selectedYears.includes(yearValue);
        });
    }
    
    // تحديث معلومات التصفية
    updateFilterInfo(selectedYears.includes('') ? 'جميع السنوات' : selectedYears.join(', '), filteredApplicants.length);
    
    // إعادة عرض النتائج
    displayResults();
    
    // عرض المرشحين المستبعدين
    displayExcludedCandidates();
    
    console.log(`تم إعادة عرض النتائج. عدد المتقدمين المتاحين: ${filteredApplicants.length}`);
}

// عرض المرشحين المستبعدين
function displayExcludedCandidates() {
    const excludedSection = document.getElementById('excludedSection');
    const excludedBody = document.getElementById('excludedBody');
    const excludedCount = document.getElementById('excludedCount');
    
    if (excludedApplicants.length === 0) {
        excludedSection.style.display = 'none';
        return;
    }
    
    // إظهار القسم
    excludedSection.style.display = 'block';
    
    // تحديث العدد
    excludedCount.textContent = excludedApplicants.length;
    
    // مسح الجدول
    excludedBody.innerHTML = '';
    
    // إضافة المرشحين المستبعدين
    excludedApplicants.forEach((excluded, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="rank">${index + 1}</td>
            <td>${excluded.name}</td>
            <td class="school-type">${excluded.schoolType === 'industrial' ? 'صناعية' : 'عامة'}</td>
            <td>${excluded.birthHijri || '-'}</td>
            <td>${excluded.excludedAt.toLocaleDateString('ar-SA')}</td>
            <td>${excluded.excludedReason}</td>
        `;
        
        excludedBody.appendChild(row);
    });
    
    console.log(`تم عرض ${excludedApplicants.length} مرشح مستبعد`);
}

// تصدير النتائج إلى ملف إكسل
function exportToExcel() {
    if (sortedApplicants.length === 0) {
        alert('لا توجد بيانات للتصدير');
        return;
    }
    
    const candidateCount = parseInt(document.getElementById('candidateCount').value) || 10;
    const exportCount = Math.min(candidateCount, filteredApplicants.length > 0 ? filteredApplicants.length : sortedApplicants.length);
    
    console.log(`عدد المرشحين المطلوب: ${candidateCount}`);
    console.log(`عدد المتقدمين المفلترين: ${filteredApplicants.length}`);
    console.log(`عدد المتقدمين المرتبين: ${sortedApplicants.length}`);
    console.log(`عدد المرشحين المصدرين: ${exportCount}`);
    
    // الحصول على السنوات المختارة
    const yearSelect = document.getElementById('graduationYear');
    const selectedOptions = Array.from(yearSelect.selectedOptions);
    const selectedYears = selectedOptions.map(option => option.value);
    const selectedYearsText = selectedYears.includes('') ? 'جميع السنوات' : selectedYears.join(', ');
    
    console.log(`السنوات المختارة: ${selectedYearsText}`);
    console.log(`الخيارات المحددة:`, selectedOptions.map(opt => opt.value));
    
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
    
    console.log('تم إضافة رأس الجدول للتصدير');
    
    // إضافة بيانات المرشحين من الثانوية الصناعية
    const industrialApplicants = filteredApplicants.filter(a => a.schoolType === 'industrial');
    const generalApplicants = filteredApplicants.filter(a => a.schoolType === 'general');
    
    console.log(`تصدير البيانات: صناعية ${industrialApplicants.length}, عامة ${generalApplicants.length}`);
    
    let exportIndex = 1;
    
    // إضافة جميع طلاب الثانوية الصناعية أولاً (أولوية مطلقة)
    const industrialCount = industrialApplicants.length;
    for (let i = 0; i < industrialCount; i++) {
        const applicant = industrialApplicants[i];
        exportData.push([
            exportIndex++,
            applicant.name,
            applicant.highSchoolGPA,
            applicant.achievementTest,
            applicant.aptitudeTest,
            applicant.graduationYear || '-',
            `${applicant.gpaPercentage}% (معدل محول)`,
            'صناعية'
        ]);
        console.log(`تصدير طالب صناعي: ${applicant.name} - المعدل: ${applicant.highSchoolGPA} - النسبة: ${applicant.gpaPercentage}%`);
    }
    
    // إضافة طلاب الثانوية العامة لإكمال العدد المطلوب
    const remainingSlots = Math.max(0, candidateCount - industrialCount);
    const generalCount = Math.min(remainingSlots, generalApplicants.length);
    
    console.log(`عدد المرشحين المطلوب: ${candidateCount}, طلاب صناعية: ${industrialCount}, أماكن متبقية: ${remainingSlots}, تصدير عام: ${generalCount}`);
    
    for (let i = 0; i < generalCount; i++) {
        const applicant = generalApplicants[i];
        exportData.push([
            exportIndex++,
            applicant.name,
            applicant.highSchoolGPA,
            applicant.achievementTest,
            applicant.aptitudeTest,
            applicant.graduationYear || '-',
            applicant.weightedScore,
            'عامة'
        ]);
        console.log(`تصدير طالب عام: ${applicant.name} - المعدل: ${applicant.highSchoolGPA} - المجموع: ${applicant.weightedScore}`);
    }
    
    // إضافة معلومات التصفية
    exportData.push([]); // صف فارغ
    exportData.push(['معلومات التصفية']);
    exportData.push(['السنوات المختارة:', selectedYearsText || 'جميع السنوات']);
    
    console.log('تم إضافة معلومات التصفية للتصدير');
    
    // إضافة إحصائيات نوع الثانوية
    const totalIndustrialCount = filteredApplicants.filter(a => a.schoolType === 'industrial').length;
    const totalGeneralCount = filteredApplicants.filter(a => a.schoolType === 'general').length;
    exportData.push(['التوزيع حسب نوع الثانوية:']);
    exportData.push(['ثانوية صناعية:', totalIndustrialCount]);
    exportData.push(['ثانوية عامة:', totalGeneralCount]);
    
    console.log(`إحصائيات التصفية: صناعية ${totalIndustrialCount}, عامة ${totalGeneralCount}`);
    
    // إضافة معلومات عن الجداول المنفصلة
    exportData.push([]);
    exportData.push(['معلومات الجداول:']);
    exportData.push(['جدول الثانوية الصناعية: أولوية مطلقة بدون تطبيق معايير']);
    exportData.push(['جدول الثانوية العامة: مع تطبيق المعايير الموزونة']);
    
    console.log('تم إضافة معلومات الجداول المنفصلة للتصدير');
    
    // لا يتم تصدير المرشحين المستبعدين (تم استبعادهم مسبقاً من filteredApplicants)
    console.log(`تم استبعاد ${excludedApplicants.length} مرشح من التصدير`);
    
    // إزالة الملاحظة القديمة: كلا النوعين يُصفّى حسب السنة عند تحديدها
    
    exportData.push(['تاريخ التصدير:', new Date().toLocaleDateString('ar-SA')]);
    
    console.log('تم إضافة تاريخ التصدير');
    console.log(`إجمالي صفوف التصدير: ${exportData.length}`);
    
    // إنشاء ورقة عمل
    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    
    // تعيين اتجاه الورقة من اليمين إلى اليسار
    if (!worksheet['!views']) {
        worksheet['!views'] = [];
    }
    worksheet['!views'][0] = { RTL: true };
    
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
    
    // تطبيق تنسيق RTL على جميع الخلايا
    for (let rowIndex = 0; rowIndex < exportData.length; rowIndex++) {
        for (let colIndex = 0; colIndex < exportData[rowIndex].length; colIndex++) {
            const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
            if (!worksheet[cellAddress]) {
                worksheet[cellAddress] = { v: exportData[rowIndex][colIndex] };
            }
            // تعيين تنسيق RTL للخلايا
            if (!worksheet[cellAddress].s) {
                worksheet[cellAddress].s = {};
            }
            worksheet[cellAddress].s = {
                alignment: {
                    horizontal: 'right',
                    vertical: 'center'
                }
            };
        }
    }
    
    console.log('تم تطبيق تنسيق الأعمدة واتجاه RTL');
    
    // إنشاء ملف العمل
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المرشحون المختارون');
    
    console.log('تم إنشاء ملف العمل');
    
    // تصدير الملف
    const fileName = `المرشحون_المختارون_${new Date().toLocaleDateString('ar-SA')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    console.log(`تم تصدير ${exportCount} مرشح إلى الملف: ${fileName}`);
    alert(`تم تصدير ${exportCount} مرشح إلى الملف: ${fileName}`);
}
