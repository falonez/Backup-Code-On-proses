import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Collection } from '@sipro/common/interface/collection';
import { FormControl, FormArray } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { KbjiPositionGroupService } from '@sipro/kbji/domains/services/kbji-position-group.service';
import { KbliPositionGroupService } from '@sipro/kbli/domains/services/kbli-position-group.service';
import { CategoryProgramService } from '@sipro/category_program/domains/services/category_program.service';
import { VocationalService } from '@sipro/vocational/domains/services/vocational.service';
import { TopicService } from '@sipro/topic/domains/services/topic.service';
import { CompetencyService } from '@sipro/competency/domains/services/competency.service';
import { BnspService } from '@sipro/bnsp/domains/services/bnsp.service';
import { ProgramService } from '@sipro/program/domains/services/program.service';
import { Role, Action, MenuRole } from '@shared/enum/role';
import { AuthStore } from '@shared/module/auth/store/AuthStore';
import { TagService } from '@sipro/tags/domains/services/tag.service';
import { InstitutionService } from '@sipro/institution/domains/services/institution.service';
import { map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators'; // Tambahkan import ini
import { CommonService } from '@sipro/common/domains/services/common.service';
import { Education } from '@sipro/common/domains/models/education';
import { SkillService } from '@sipro/skill/domains/services/skill.service';
@Component({
    selector: 'sipro-program-form-v2',
    templateUrl: './program-form-v2.component.html',
    styleUrls: ['./program-form-v2.component.scss'],
})
export class ProgramFormV2 implements OnInit {
    // Set Wizard Step:
    currentWizardStep: number;
    public wizardSteps: any[] = [
        {
            id: 1,
            title: 'Program Pelatihan',
        },
        {
            id: 2,
            title: 'Persyaratan Instruktur',
        },
        {
            id: 3,
            title: 'Persyaratan Peserta',
        },
        {
            id: 4,
            title: 'Keterampilan',
        },
        {
            id: 5,
            title: 'Unit Kompetensi',
        },
        {
            id: 6,
            title: 'Kodefikasi',
        },
    ];

    // public previousStep = () => {
    //     if (this.currentWizardStep === 1) {
    //         return;
    //     }
    //     this.currentWizardStep--;
    // };

    // public nextStep = () => {
    //     if (this.currentWizardStep === this.wizardSteps.length) {
    //         return;
    //     }
    //     this.currentWizardStep++;

    //     if (this.currentWizardStep === 6) {
    //         this.generateKodefikasi();
    //     }
    // };

    // public goToStep(step: number) {
    //     this.currentWizardStep = step;

    //     // Jika langkah ke-6 dipilih, panggil fungsi generateKode
    //     if (this.currentWizardStep === 6) {
    //         this.generateKodefikasi();
    //     }
    // }

    // End Wizard Step

    public kbjiDigitOne$: Observable<Collection<any>>;
    public kbjiDigitFour$: Observable<Collection<any>>;
    public kbliDigitFour$: Observable<Collection<any>>;
    public categoryProgramList$: Observable<Collection<any>>;
    public tags$;
    public vocationals$;
    public subVocationals$;
    public modules$;
    public bnsp$;
    public typeSelected: any;
    public defaultItem = { name: 'Semua Unit Kompetensi', id: null };
    public typeUnitKompetensi = [{ name: 'SKKNI', id: 1 }, { name: 'Internasional', id: 2 }, { name: 'Khusus', id: 3 }];
    public Role = Role;
    public MenuRole = MenuRole;
    public Action = Action;
    public user$;
    public institutionsLembaga$;
    public programData;
    public skillList$;

    form: FormGroup;
    isEditMode = false; // Indikator untuk mode edit atau create
    submitted = false;
    tabActive = '';
    public level_jenjang_list;
    public types: any = [];
    public types_tkm: any = [];
    availableTags: string[] = []; // Array tag untuk komponen tag-input
    filteredTags: string[] = []; // Array tag untuk komponen tag-input
    public educations$: Observable<Education[]>;

    constructor(
        private kbjiService: KbjiPositionGroupService,
        private kbliService: KbliPositionGroupService,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private categoryProgramService: CategoryProgramService,
        private vocationalService: VocationalService,
        private topicService: TopicService,
        public competencyService: CompetencyService,
        public bnspService: BnspService,
        public programService: ProgramService,
        private auth: AuthStore,
        private tagService: TagService,
        private institutionService: InstitutionService,
        private commonService: CommonService,
        private skillService: SkillService,
    ) {
        this.kbjiService.fetchAllDigitOne();
        this.kbjiDigitOne$ = this.kbjiService.kbjiDigitOne$;
        this.kbjiService.fetchAllDigitFour();
        this.kbjiDigitFour$ = this.kbjiService.kbjiDigitFour$;
        this.kbliService.fetchAllDigitFour();
        this.kbliDigitFour$ = this.kbliService.kbliDigitFour$;
        this.categoryProgramService.fetchAllQuery();
        this.categoryProgramList$ = this.categoryProgramService.categoryProgramList$;
        this.vocationalService.fetchAllGroups();
        this.vocationalService.fetchAll();
        this.vocationals$ = this.vocationalService.vocationals$;
        this.subVocationals$ = this.vocationalService.subVocationals$;
        this.topicService.fetchPublicModule();
        this.modules$ = this.topicService.modules$;
        this.bnspService.fetchAll();
        this.bnsp$ = this.bnspService.bnsp$;
        this.user$ = this.auth.user$;
        this.tagService.query.limit = 1000;
        this.tagService.fetchAll();
        this.tags$ = this.tagService.tags$;
        this.institutionService.query.hasCode = true;
        this.institutionService.fetchAllLembaga();
        this.institutionsLembaga$ = this.institutionService.institutionsLembaga$;

        this.commonService.fetchAll();
        this.educations$ = this.commonService.educations$;
        this.skillService.fetchAll();
        this.skillList$ = this.skillService.skillList$;

        this.currentWizardStep = 1;
    }

    // Validasi custom untuk format Rupiah
    rupiahValidator(control: any) {
        const value = control.value;
        if (value) {
            // Regular expression untuk validasi angka dengan format Rp dan pemisah ribuan
            const regex = /^Rp\s?(\d{1,3})(\.\d{3})*(,\d+)?$/;
            if (!regex.test(value)) {
                return { invalidRupiah: true };
            }
        }
        return null;
    }

    // Fungsi untuk memformat input menjadi format uang (Rp.)
    formatRupiah(event: any) {
        let value = event.target.value;
        // Menghapus karakter selain angka
        value = value.replace(/[^0-9]/g, '');

        // Menambahkan pemisah ribuan
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        // Menambahkan 'Rp.' di depan
        event.target.value = 'Rp. ' + value;
    }

    ngOnInit() {
        this.skillList$.subscribe(data => {
            console.log('Data skillList$:', data);
        });
        const activeTab = this.route.snapshot.queryParamMap.get('activeTab');
        this.tabActive = activeTab || '1';

        this.form = this.fb.group({
            versi: ['01', Validators.required],
            tahunTerbit: [
                null,
                [Validators.required, Validators.pattern(/^\d{4}$/)], // Validasi: hanya angka 4 digit
            ],
            tipe_publikasi: [null, Validators.required],
            lembaga: [null, Validators.required],
            kbji: [null, Validators.required],
            kbli: [null, Validators.required],
            kejuruan: [null, Validators.required],
            bidang_keahlian: [null, Validators.required],
            nama_program_pelatihan: [null, Validators.required],
            metode_pelatihan: [null, Validators.required],
            deskripsi_pelatihan: [null],
            tujuan_program: [null],
            skema_sertifikasi: [null, Validators.required],
            jenjang: [null, Validators.required],
            tags: [[]],
            jenis_program: [null, Validators.required],
            tipe_okupasi: [null, Validators.required],
            kategori_program: [null, Validators.required],
            gambar_pelatihan: [null, Validators.required],
            // wizard 2
            min_pendidikan: [null, Validators.required],
            pendidikan_instruktur: [null, Validators.required],
            max_pendidikan: [null, Validators.required],
            pengalaman_mengajar: [null, [Validators.required, Validators.pattern(/^\d{1,3}$/)]],
            kemampuan_metodologi: [null, Validators.required],
            kemampuan_teknis: [null],
            persyaratan_khusus: [null, Validators.required],
            // wizard 3
            kemampuan_dasar: [null],
            pelatihan: [null, Validators.required],
            pengalaman_kerja: [null, [Validators.required, Validators.pattern(/^\d{1,3}$/)]],
            maksimal_usia: [null, [Validators.required, Validators.pattern(/^\d{1,3}$/), Validators.min(19)]],
            persyaratan_khusus_peserta: [null, Validators.required],
            jenis_kelamin: [null, Validators.required],
            // wizard 4
            keahlian2: [[]],
            // kodefikasi
            kodefikasi: [null, Validators.required],
            dokumen_program: [],
            dokumen_rab: [],
            type_tkm: [],
            jkp_harga: [''],
            dataSementara: this.fb.array([], Validators.required)
        });
        
        // Inisialisasi form
        this.unitKompetensiForm = this.fb.group({
            id: [''],
            tipe: [null, Validators.required],
            judul: [null, Validators.required],
            kode: [''],
            materi: [''],
            durasi: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^\d{1,4}$/), // Hanya angka dengan maksimal 4 digit
                ],
            ],
            code: [''], // Validasi angka
            referensi: [''],
            deskripsi: [null, Validators.required],
        });

        this.types = [
            {
                name: 'SKKNI',
                value: 'skkni',
            },
            {
                name: 'Internasional',
                value: 'international',
            },
            {
                name: 'Khusus',
                value: 'special',
            },
        ];

        this.types_tkm = [
            {
                name: 'Mikro',
                value: 'micro',
            },
            {
                name: 'Ultra Mikro',
                value: 'ultra_micro',
            },
        ];

        // Cek apakah ini adalah mode edit berdasarkan rute
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode = true;
            this.loadProgramData(id); // Memuat data role untuk edit
            console.log(id);
        }
    }
    
    // Getter untuk FormArray
    get dataSementara(): FormArray {
        return this.form.get('dataSementara') as FormArray;
    }


    tagControl = new FormControl('');
    // Fungsi untuk memuat data berdasarkan id
    loadProgramData(id: string) {
        // Panggil API untuk memuat data (simulasi
        this.programService.fetchById(id);
        this.programData = this.programService.program$;
        this.programData.subscribe(data => {
            console.log('testig', data);

            this.form.patchValue({
                versi: data.versi || '01',
                tahunTerbit: data.publicationYear,
                tipe_publikasi: data.tipe_publikasi,
                // kbji: data.kbjiPositionSubGroupId,
                // kbli: data.kbliPositionSubGroupId,
                kejuruan: data.vocational,
                bidang_keahlian: data.subVocational,
                nama_program_pelatihan: data.title,
                metode_pelatihan: data.metode_pelatihan,
                deskripsi_pelatihan: data.description,
                tujuan_program: data.purpose,
                skema_sertifikasi: data.skema_sertifikasi,
                jenjang: data.jenjang,
                // tags: data.tags,
                jenis_program: data.jenis_program,
                kategori_program: data.kategori_program,
                gambar_pelatihan: data.gambar_pelatihan,
                // wizard 2
                pengalaman_mengajar: data.instructor_work_experience,
                kemampuan_metodologi: data.instructor_methodological_competence,
                kemampuan_teknis: data.instructor_technical_competence,
                persyaratan_khusus: data.persyaratan_khusus,
                // wizard 3
                kemampuan_dasar: data.kemampuan_dasar,
                pelatihan: data.pelatihan,
                pengalaman_kerja: data.pengalaman_kerja,
                maksimal_usia: data.maksimal_usia,
                persyaratan_khusus_peserta: data.trainee_qualification,
                jenis_kelamin: data.jenis_kelamin,
                // wizard 4
                keahlian: data.keahlian,
                // kodefikasi
                kodefikasi: data.kodefikasi,
                dokumen_program: data.dokumen_program,
            });
        });
    }

    // Fungsi untuk submit form
    onSubmit() {
        this.submitted = true;
        // Jika form invalid, hentikan proses
        if (this.form.invalid) {
            return;
        }
        const formData = new FormData();

        // Tambahkan data sederhana
        formData.append('title', this.form.value.nama_program_pelatihan);
        formData.append('description', this.form.value.deskripsi_pelatihan);
        formData.append('vocational_id', this.form.value.kejuruan.id);
        formData.append('vocational_name', this.form.value.kejuruan.name);
        formData.append('sub_vocational_id', this.form.value.bidang_keahlian.id);
        formData.append('sub_vocational_name', this.form.value.bidang_keahlian.name);
        formData.append('level', this.form.value.jenjang.id);
        formData.append('cover_image', this.form.value.gambar_pelatihan.file);
        formData.append('trainee_basic_skill', this.form.value.kemampuan_dasar);
        formData.append('trainee_work_experience', this.form.value.kemampuan_dasar);
        formData.append('trainee_qualification', this.form.value.persyaratan_khusus_peserta);
        formData.append('instructor_work_experience', this.form.value.pengalaman_mengajar);
        formData.append('instructor_methodological_competence', this.form.value.kemampuan_metodologi);
        formData.append('instructor_technical_competence', this.form.value.kemampuan_teknis);
        formData.append('instructor_health', this.form.value.persyaratan_khusus);
        formData.append('instructor_qualification', this.form.value.persyaratan_khusus);
        formData.append('type', this.form.value.metode_pelatihan);
        formData.append('private', this.form.value.tipe_publikasi == 'public' ? 'true' : 'false');
        formData.append('private', this.form.value.tipe_publikasi == 'public' ? '1' : '0');
        formData.append('kbji_position_sub_group_id', this.form.value.kbji.id);
        formData.append('kbli_position_sub_group_id', this.form.value.kbli.id);
        formData.append('publication_year', this.form.value.tahunTerbit);
        formData.append('schema_certifications[]', this.form.value.skema_sertifikasi.id);
        formData.append('material_value', this.form.value.dokumen_program.file);
        formData.append('trainee_min_education_id', this.form.value.min_pendidikan.id);
        formData.append('trainee_max_education_id', this.form.value.max_pendidikan.id);
        formData.append('purpose', this.form.value.tujuan_program);
        // this.dataSementara.forEach((item, index) => {
        //     formData.append(`modules[${index}][module_id]`, item.id);
        //     formData.append(`modules[${index}][duration]`, item.durasi);
        //     formData.append(`modules[${index}][description]`, item.deskripsi);
        //     formData.append(`modules[${index}][references]`, item.referensi);
        // });
        (this.form.get('dataSementara') as FormArray).controls.forEach((item, index) => {
            const itemValue = item.value; // Ambil nilai dari FormGroup
            formData.append(`modules[${index}][module_id]`, itemValue.id);
            formData.append(`modules[${index}][duration]`, itemValue.durasi);
            formData.append(`modules[${index}][description]`, itemValue.deskripsi);
            formData.append(`modules[${index}][references]`, itemValue.referensi);
          });
          
        formData.append('category', this.form.value.kategori_program.name.toLowerCase());
        formData.append('occupation', this.form.value.tipe_okupasi.id == 'okupasi' ? 'yes' : 'no');
        if (this.form.value.tipe_publikasi != 'public') {
            formData.append('lemsar_institution_parent_id', this.form.value.lembaga.id);
        }
        if (this.form.value.kategori_program.name == 'TKM') {
            formData.append('tkm_type', this.form.value.type_tkm.value);
        }
        if (this.form.value.kategori_program.name == 'JKP') {
            formData.append('price', this.form.value.jkp_harga);
            formData.append('budget_draft_document', this.form.value.dokumen_rab.file);
        }
        this.form.value.keahlian2.forEach((keahlian: any) => {
            formData.append('skills[]', keahlian.key);
        });
        this.form.value.tags.forEach((tags: any) => {
            formData.append('tags[]', tags.name);
        });
        if (this.form.value.skema_sertifikasi) {
            formData.append('certification_scheme', 'yes');
            // formData.append('schema_certifications[0][id]', this.form.value.skema_sertifikasi.id);
            // formData.append('schema_certifications[0][name]', this.form.value.skema_sertifikasi.name);
        }
        formData.append('program_type', this.kodekkniHuruf);
        formData.append('material_value', this.form.value.dokumen_program.file);
        formData.append('trainee_max_age', this.form.value.maksimal_usia);
        formData.append('code', this.form.value.kodefikasi);
        formData.append('material_type', 'file');

        formData.append('trainee_gender', '');
        formData.append('materials', '');
        formData.append('tools', '');
        formData.append('trainee_health', '');
        formData.append('trainee_min_age', '18');
        formData.append('certification_linked', '0');
        formData.append('difficulty_level', 'intermediate');
        // Kirim FormData ke API
        return this.programService.insertProgram(formData);
        // Arahkan ke halaman lain setelah selesai
    }

    checkLevel(jenisProgram: any, jenjangId: any): string {
        if (jenisProgram === 'kkni') {
            if (jenjangId >= 1 && jenjangId <= 3) {
                return 'Beginner';
            } else if (jenjangId >= 4 && jenjangId <= 6) {
                return 'Intermediate';
            } else if (jenjangId >= 7 && jenjangId <= 9) {
                return 'Expert';
            }
        } else if (jenisProgram === 'klaster') {
            if (jenjangId === 1) {
                return 'Beginner';
            } else if (jenjangId === 2) {
                return 'Intermediate';
            } else if (jenjangId === 3) {
                return 'Expert';
            }
        } else if (jenisProgram === 'unit_kompetensi') {
            if (jenjangId === 1) {
                return 'Beginner';
            } else if (jenjangId === 2) {
                return 'Intermediate';
            } else if (jenjangId === 3) {
                return 'Expert';
            }
        }

        // Jika tidak memenuhi kondisi di atas
        return 'Unknown Level';
    }

    onValueChange(event: any, typeSelect: any): void {
        if (typeSelect == 'kategori_program') {
            // set validator
        } else if (typeSelect == 'kejuruan') {
            this.vocationalService.fetchVocationalById(event.id);
        } else if (typeSelect == 'jenis_program') {
            this.level_jenjang_list = null;
            // public level jenjang tergantung jenis_program_list
            if (event.id === 'unit_kompetensi') {
                this.level_jenjang_list = [
                    { id: '1', name: 'Unit Kompetensi Dasar' },
                    { id: '2', name: 'Unit Kompetensi Menengah' },
                    { id: '3', name: 'Unit Kompetensi Tinggi' },
                ];
            }
        } else if (typeSelect == 'typeSelected') {
            console.log('typeSelect', typeSelect);
            this.typeSelected = event;
            if (this.typeSelected == 'SKKNI') {
                this.topicService.query['topic_type'] = 'skkni';
            } else if (this.typeSelected == 'Internasional') {
                this.topicService.query['topic_type'] = 'international';
            } else {
                this.topicService.query['topic_type'] = 'special';
            }
            // hit api sesuai yang dipilih
            this.topicService.fetchPublicModule();
            this.modules$ = this.topicService.modules$;
            console.log('Selected value:', this.typeSelected);
        } else if (typeSelect == 'pilih_unitkompetensi') {
            console.log('ininilain', event);
            // Hit API by ID
            this.competencyService.getByIdModuleAPI(event).subscribe((data: any) => {
                console.log('Data Module:', data);
                // set ke form
                this.unitKompetensiForm.patchValue({
                    id: data.id, // Nilai awal untuk kode
                    judul: data.title,
                    code: data.code,
                    materi: data.link,
                    tipe: this.typeSelected,
                    durasi: data.duration,
                    referensi: data.references,
                    deskripsi: data.description,
                });
            });
        } else if (typeSelect == 'tipe_okupasi') {
            console.log(this.form);
            if (this.form.value.jenis_program.id == 'klaster') {
                if (this.form.value.tipe_okupasi.id == 'okupasi') {
                    this.level_jenjang_list = [
                        { id: '1', name: 'Okupasi Dasar' },
                        { id: '2', name: 'Okupasi Menengah' },
                        { id: '3', name: 'Okupasi Tinggi' },
                    ];
                } else {
                    this.level_jenjang_list = [
                        { id: '1', name: 'Non Okupasi Dasar' },
                        { id: '2', name: 'Non Okupasi Menengah' },
                        { id: '3', name: 'Non Okupasi Tinggi' },
                    ];
                }
            } else if (this.form.value.jenis_program.id == 'kkni') {
                if (this.form.value.tipe_okupasi.id == 'okupasi') {
                    this.level_jenjang_list = [
                        { id: '1', name: 'KKNI Jenjang 1' },
                        { id: '2', name: 'KKNI Jenjang 2' },
                        { id: '3', name: 'KKNI Jenjang 3' },
                        { id: '4', name: 'KKNI Jenjang 4' },
                        { id: '5', name: 'KKNI Jenjang 5' },
                        { id: '6', name: 'KKNI Jenjang 6' },
                        { id: '7', name: 'KKNI Jenjang 7' },
                        { id: '8', name: 'KKNI Jenjang 8' },
                        { id: '9', name: 'KKNI Jenjang 9' },
                    ];
                } else {
                    this.level_jenjang_list = [
                        { id: '1', name: 'Kualifikasi 1' },
                        { id: '2', name: 'Kualifikasi 2' },
                        { id: '3', name: 'Kualifikasi 3' },
                        { id: '4', name: 'Kualifikasi 4' },
                        { id: '5', name: 'Kualifikasi 5' },
                        { id: '6', name: 'Kualifikasi 6' },
                        { id: '7', name: 'Kualifikasi 7' },
                        { id: '8', name: 'Kualifikasi 8' },
                        { id: '9', name: 'Kualifikasi 9' },
                    ];
                }
            }
        }
    }

    // Getter untuk akses form field
    get f() {
        return this.form.controls;
    }

    // Data Dummy / Tanpa Master Data
    public jenis_program_list = [
        { id: 'kkni', name: 'KKNI' },
        { id: 'klaster', name: 'Klaster' },
        { id: 'unit_kompetensi', name: 'Unit Kompetensi' },
    ];

    public tipe_okupasi_list = [{ id: 'okupasi', name: 'Okupasi' }, { id: 'non_okupasi', name: 'Non Okupasi' }];

    unitKompetensiForm: FormGroup; // Form utama
    // dataSementara: any[] = []; // Menyimpan data sementara
    isHidden: boolean = false; // Status untuk hide/unhide daftar data

    // Tambah data ke daftar sementara
    // tambahData() {
    //     console.log('checking unitKompetensiForm', this.unitKompetensiForm);
    //     console.log('checking form', this.form);
    //     console.log('checking dataSementara', this.dataSementara);
    //     this.markAllAsTouched(this.unitKompetensiForm); // Tandai semua kontrol

    //     if (this.unitKompetensiForm.valid) {
    //         this.dataSementara.push(this.unitKompetensiForm.value);

    //         // Reset form setelah menambahkan
    //         this.unitKompetensiForm.reset();
    //     } else {
    //         alert('Form belum lengkap!');
    //     }
    // }
    
    // Tambahkan FormGroup ke dalam dataSementara
    tambahData() {
        console.log('checking unitKompetensiForm', this.unitKompetensiForm);
        console.log('checking form', this.form);
        console.log('checking dataSementara', this.dataSementara);
        if (this.unitKompetensiForm.valid) {
        const formGroup = this.fb.group({
            id: [this.unitKompetensiForm.value.id],
            tipe: [this.unitKompetensiForm.value.tipe],
            code: [this.unitKompetensiForm.value.code],
            judul: [this.unitKompetensiForm.value.judul],
            materi: [this.unitKompetensiForm.value.materi],
            durasi: [this.unitKompetensiForm.value.durasi],
            deskripsi: [this.unitKompetensiForm.value.deskripsi],
            referensi: [this.unitKompetensiForm.value.referensi],
        });
    
        this.dataSementara.push(formGroup);  // Menambah FormGroup ke dalam FormArray
        this.unitKompetensiForm.reset();
        }
    }

    private markAllAsTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            if (control instanceof FormGroup) {
                this.markAllAsTouched(control);
            } else {
                control ? control.markAsTouched() : null;
            }
        });
    }

    // Hapus data dari daftar sementara
    // hapusData(index: number) {
    //     // this.dataSementara.splice(index, 1);
    // }
    
    hapusData(index: number): void {
        const formArray = this.form.get('dataSementara') as FormArray;
        if (formArray) {
            formArray.removeAt(index); // Hapus elemen di index yang diberikan
        }
    }

    // Toggle visibility daftar sementara
    toggleVisibility() {
        this.isHidden = !this.isHidden;
    }

    kodekkni = '';
    kodekkniHuruf = '';
    metodeCode = '';
    public sequenceCode: any = '';
    async generateKodefikasi() {
        if (this.form.value.kejuruan) {
            // Tunggu hasil dari getSequenceNumber
            this.sequenceCode = await this.getSequenceNumber(this.form.value.kejuruan.id).toPromise();
            console.log('sequenceCode:', this.sequenceCode);
        }

        console.log('test', this.form.value);
        if (this.form.value.jenis_program.name == 'KKNI') {
            this.kodekkni = 'J' + this.form.value.jenjang.id;
            this.kodekkniHuruf = 'J';
        } else if (this.form.value.jenis_program.name == 'Klaster') {
            this.kodekkni = 'K' + this.form.value.jenjang.id;
            this.kodekkniHuruf = 'K';
        } else if (this.form.value.jenis_program.name == 'Unit Kompetensi') {
            this.kodekkni = 'U' + this.form.value.jenjang.id;
            this.kodekkniHuruf = 'U';
        }

        if (this.form.value.metode_pelatihan == 'online') {
            this.metodeCode = 'D';
        } else if (this.form.value.metode_pelatihan == 'offline') {
            this.metodeCode = 'L';
        } else if (this.form.value.metode_pelatihan == 'blended') {
            this.metodeCode = 'B';
        }

        const duaAngkaTahun = this.form.value.tahunTerbit.slice(-2);

        // const totalDurasi = this.dataSementara.reduce((total, data) => total + (data.durasi || 0), 0);
        const totalDurasi = (this.form.get('dataSementara') as FormArray).controls
        .reduce((total, control) => {
            const durasi = control.get('durasi') && control.get('durasi').value;
            return total + (durasi || 0);
        }, 0);
        const formattedDurasi = totalDurasi.toString().padStart(4, '0');

        if (this.form.value.tipe_publikasi == 'private') {
            const LembagaCode = this.form.value.lembaga.code;
            const kodefikasi =
                LembagaCode +
                '.' +
                this.form.value.kbli.kbliPositionGroup.kbliPositionSubPrincipal.kbliPositionPrincipal.code.trim() +
                '.' +
                this.form.value.kbli.kbliPositionGroup.kbliPositionSubPrincipal.code +
                '.' +
                this.form.value.kejuruan.code +
                '.' +
                this.form.value.bidang_keahlian.kode +
                '.' +
                this.form.value.kbji.code +
                '.' +
                this.kodekkni +
                '.' +
                duaAngkaTahun +
                '.' +
                this.metodeCode +
                '.' +
                formattedDurasi +
                '.' +
                this.form.value.versi +
                '.' +
                this.sequenceCode;
            console.log('kodefikasi now :', kodefikasi);
            this.form.patchValue({
                kodefikasi: kodefikasi,
            });
        } else {
            const kodefikasi =
                this.form.value.kbli.kbliPositionGroup.kbliPositionSubPrincipal.kbliPositionPrincipal.code +
                '.' +
                this.form.value.kbli.kbliPositionGroup.kbliPositionSubPrincipal.code +
                '.' +
                this.form.value.kejuruan.code +
                '' +
                this.form.value.bidang_keahlian.kode +
                '.' +
                this.form.value.kbji.code +
                '.' +
                this.kodekkni +
                '.' +
                duaAngkaTahun +
                '.' +
                this.metodeCode +
                '.' +
                formattedDurasi +
                '.' +
                this.form.value.versi;
            '.' + this.sequenceCode;
            console.log('kodefikasi now :', kodefikasi);

            this.form.patchValue({
                kodefikasi: kodefikasi,
            });
        }
    }

    getSequenceNumber(vocationalId: string): Observable<string> {
        this.programService.query['vocational'] = vocationalId || '';
        this.programService.query['sortBy'] = 'created_at';
        this.programService.query['sortOrder'] = 'asc';
        return this.programService.fetchForCodefication().pipe(
            map(programs => {
                console.log('Fetched programs Untuk KODEFIKASIII:', programs);
                if (programs.data.length > 0 && programs.data[0].code) {
                    // Ambil bagian terakhir dari kodefikasi, misalnya "01" dan tambahkan 1
                    const lastCode = programs.data[0].code.split('.').pop(); // Ambil bagian terakhir setelah split
                    const newCode = (parseInt(lastCode, 10) + 1).toString().padStart(2, '0');
                    return newCode;
                } else {
                    return '01'; // Jika tidak ada data, return "01"
                }
            }),
            catchError(error => {
                console.error('Error fetching programs:', error);
                return of('01'); // Jika terjadi error, return "01"
            }),
        );
    }

    onSubmits(): void {
        this.markAllAsTouched(this.unitKompetensiForm); // Tandai semua kontrol
        console.log('test masuk dong');
        if (this.unitKompetensiForm.invalid) {
            // Fokus pada error handling secara manual
            console.log('Form invalid:', this.unitKompetensiForm.value);
        } else {
            console.log('Form valid:', this.unitKompetensiForm.value);
        }
    }

    isFormVisible: boolean = false; // Menentukan apakah form ditampilkan atau tidak
    // formData = {
    //     tipeUnit: 'SKKNI',
    //     kodeUnit: 'LAB.KK03.006.01',
    //     judulSKKNI: 'Unit 1',
    //     materi: 'PERTANIAN PADI',
    //     durasi: 8,
    //     deskripsi: '<p>Berikut merupakan peralatan yang digunakan untuk mengikuti program pelatihan ini.</p>',
    //     referensi: '<p>Berikut merupakan peralatan yang digunakan untuk mengikuti program pelatihan ini.</p>',
    // };

    showForm(): void {
        this.isFormVisible = true;
    }

    hideForm(): void {
        this.isFormVisible = false;
    }

    onDelete(): void {
        console.log('Hapus data');
        // Tambahkan logika penghapusan data di sini
    }

    // toggleVisibilityChenron(index: number): void {
    //     this.dataSementara[index].isVisible = !this.dataSementara[index].isVisible;
    // }
    
    toggleVisibilityChenron(index: number): void {
        console.log('okee')
        const formArray = this.form.get('dataSementara') as FormArray;
        const formGroup = formArray.at(index) as FormGroup;
        
        // Mengubah nilai dari kontrol isVisible di FormGroup
        const isVisibleControl = formGroup.get('isVisible');
        
        if (isVisibleControl) {
          isVisibleControl.setValue(!isVisibleControl.value);
        }
      }
      

    canAccess(menu: string, action: string): boolean {
        const permissions = this.auth.getPermissions();
        if (permissions[menu] && permissions[menu][action] !== undefined) {
            return permissions[menu][action];
        }
        return false;
    }

    skills = [{ id: 1, name: 'Angular' }, { id: 2, name: 'React' }, { id: 3, name: 'Vue' }, { id: 4, name: 'Node.js' }];
    skillControl = new FormControl(null);
    isSubmitted = false;

    onSkillChange(event: any) {
        console.log('Selected skill:', event);
        this.form.patchValue({
            keahlian: event,
        });
    }

    onSkillFilter(event: string) {
        console.log('Filter:', event);
    }
    
    // Fungsi untuk pindah ke step tertentu
    goToStep(stepId: number): void {
        this.setError(stepId);
        if(this.currentWizardStep == 1){
            this.setError(this.currentWizardStep);
        }

        // Pindah ke step berikutnya meskipun ada field yang invalid
        this.currentWizardStep = stepId;

        // Jika step terakhir (misalnya step 6), bisa lakukan aksi lain jika diperlukan
        if (this.currentWizardStep === 6) {
        this.generateKodefikasi();
        }
    }

    // Fungsi untuk mendeteksi field yang terkait dengan step tertentu
    getFieldsForStep(stepId: number): string[] {
    switch (stepId) {
        case 1:
            return [
                'versi', 
                'tahunTerbit', 
                'tipe_publikasi', 
                'lembaga', 
                'kbji', 
                'kbli', 
                'kejuruan', 
                'bidang_keahlian', 
                'nama_program_pelatihan', 
                'metode_pelatihan', 
                'deskripsi_pelatihan', 
                'tujuan_program', 
                'skema_sertifikasi', 
                'jenjang', 
                'tags', 
                'keahlian2', 
                'jenis_program', 
                'tipe_okupasi', 
                'kategori_program', 
                'gambar_pelatihan',
                'type_tkm', 
                'jkp_harga',
                'dokumen_rab'
            ];
        case 2:
            return [
                'pendidikan_instruktur', 
                'pengalaman_mengajar', 
                'kemampuan_metodologi', 
                'kemampuan_teknis', 
                'persyaratan_khusus'
            ];
        case 3:
            return [
                'min_pendidikan', 
                'max_pendidikan', 
                'kemampuan_dasar', 
                'pelatihan', 
                'pengalaman_kerja', 
                'maksimal_usia', 
                'persyaratan_khusus_peserta', 
                'jenis_kelamin'
            ];
        case 4:
            return [
                'keahlian'
            ];
        case 5:
            return [
                'tipe', 
                'judul', 
                'kode', 
                'materi', 
                'durasi', 
                'code', 
                'referensi', 
                'deskripsi'
            ];
        case 6:
            return [
                'kodefikasi', 
                'dokumen_program', 
            ];
        default:
            return [];
    }
}

    // Menyimpan status invaliditas setiap langkah
    invalidSteps: boolean[] = [];
    // Fungsi untuk mengubah status invalid pada step
    setInvalidStep(stepId: number, isInvalid: boolean): void {
        this.invalidSteps[stepId - 1] = isInvalid;
        console.log(this.invalidSteps ,' invalidSteps2222')
    }
    
    // Fungsi untuk melanjutkan ke step sebelumnya
    previousStep() {
        if (this.currentWizardStep === 1) {
        return;
        }
        this.setError(this.currentWizardStep);
        this.currentWizardStep--;
    }
    
    setError(numberWizard:number){
        let fields;
        console.log(this.form,'form')
        console.log(fields,'fields')
        
        let formToValidate = this.form; // Default form

        if (numberWizard === 5) {
            // Untuk wizard 5, gunakan unitKompetensiForm
            fields = this.getFieldsForStep(numberWizard);
            formToValidate = this.unitKompetensiForm;
        } else {
            fields = this.getFieldsForStep(numberWizard);
        }
        const isStepInvalid = fields.some((field) => {
            console.log(field,"file sdsdsdsdsdsdsdsdsd")
            const control = formToValidate.get(field);
            console.log(control,"file sdsdsdsdsdsdsdsdsd")
            return control && control.invalid;
        });
        
        console.log(isStepInvalid,'isStepInvalid')
        
        // Tandai step tersebut invalid jika ada field yang tidak valid
        if(isStepInvalid == true){
            this.setInvalidStep(numberWizard, true);
        } else{
            this.setInvalidStep(numberWizard, false);
        }
    }

    // Fungsi untuk melanjutkan ke step berikutnya
    nextStep() {
        if (this.currentWizardStep === this.wizardSteps.length) {
        return;
        }
        this.setError(this.currentWizardStep);
        this.currentWizardStep++;
    }
}
