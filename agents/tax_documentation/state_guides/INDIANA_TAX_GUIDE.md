# INDIANA STATE TAX GUIDE
**For: Financial Agent (CPA)**  
**Business Operations in Indiana**

---

## 🏛️ INDIANA TAX OVERVIEW

### Corporate/ Business Taxes:
| Tax Type | Rate | Notes |
|----------|------|-------|
| **Corporate Income Tax** | 4.9% (2026) | Decreasing to 3.0% by 2029 |
| **Individual Income Tax** | 3.23% | Flat rate (decreasing to 3.0% by 2029) |
| **Sales Tax** | 7% | State only, no local add-on |
| **Personal Property Tax** | Varies | On business equipment |
| **Unemployment Tax** | 0.5-7.4% | New employer: 2.5% |

### Filing Requirements:
- **Resident:** File if income >$1,000
- **Non-resident:** File if Indiana-sourced income
- **Business:** File if nexus in Indiana

---

## 💼 BUSINESS INCOME TAX

### Indiana Adjusted Gross Income (AGI)

**Calculation:**
```
Federal AGI
+ Additions (state-specific)
- Deductions (state-specific)
= Indiana AGI
× 3.23% (flat rate)
= Indiana Tax Liability
```

**Additions to Federal AGI:**
- Interest from non-Indiana municipal bonds
- Out-of-state business losses (if deducted federally)
- Lump-sum distributions not included federally

**Deductions from Federal AGI:**
- Interest from Indiana municipal bonds
- Unemployment compensation (if included federally)
- Social Security benefits (if included federally)
- Military income (for residents)

### Business Structure Specifics:

**Sole Proprietorship/LLC:**
- Report on Schedule IT-40 (individual return)
- Pass-through income taxed at 3.23%
- File by April 15

**S-Corporation:**
- Indiana recognizes federal S-Corp election
- File Form IT-20S (S-Corp return)
- Pass-through to shareholders
- Due date: 15th day of 3rd month after year-end

**C-Corporation:**
- File Form IT-20 (corporate return)
- Tax rate: 4.9% (2026)
- Decreasing 0.5% per year until 3.0% in 2029
- Due date: 15th day of 4th month after year-end

**Partnership:**
- File Form IT-65 (partnership return)
- Pass-through to partners
- Informational return only

---

## 🛒 INDIANA SALES TAX (SAAS)

### SaaS Taxability:
**YES** - Indiana taxes pre-written software delivered electronically

### Tax Rate:
**7%** - State rate only (no local Indiana sales taxes)

### Nexus Threshold:
- **$100,000** in annual Indiana sales, OR
- **200** separate transactions in Indiana

### Registration:
- **Online:** INTIME.in.gov
- **Phone:** 317-232-2240
- **Required:** Before first taxable sale (or within 30 days of crossing nexus)

### Filing Frequency:
| Monthly Tax Liability | Filing Frequency |
|----------------------|------------------|
| $1,000+ | Monthly |
| $250 - $999 | Quarterly |
| <$250 | Annually |

### Due Dates:
- **Monthly:** 20th of following month
- **Quarterly:** Last day of month following quarter
- **Annual:** January 31

### Exemptions:
- Sales to federal government
- Sales to Indiana state/local government (with exemption certificate)
- Sales to 501(c)(3) nonprofits (with exemption certificate)
- Interstate commerce (if delivery outside Indiana)

### Exemption Certificates:
- **Form ST-105:** General sales tax exemption
- Must be collected and retained for exempt sales
- Valid for 5 years
- Available at: IN.gov/dor/tax-forms

### SaaS Specific Considerations:

**Multi-State Customers:**
- If customer accesses software in Indiana → Indiana tax due
- If customer accesses outside Indiana → No Indiana tax
- Must track user location

**B2B vs B2C:**
- B2B: Generally taxable unless exempt org
- B2C: Taxable

**Implementation Services:**
- SaaS subscription: Taxable (7%)
- Setup/training services: Taxable if bundled
- Standalone professional services: Non-taxable

**Best Practice:**
- Separate SaaS fees from service fees on invoices
- Collect exemption certificates from schools/govt
- Use automated tax calculation (Avalara/TaxJar)

---

## 🎓 LEARNING TIME VR SUBSCRIPTION TAX IMPLICATIONS

### LTVR SaaS Taxability by State

| State | SaaS Taxable | Rate | Nexus Threshold | Status |
|-------|-------------|------|-----------------|--------|
| **Indiana** | YES | 7% | $100K / 200 txns | Active — collecting |
| **Ohio** | YES | 5.75% | $100K / 200 txns | Monitor sales volume |
| **Illinois** | NO | N/A | N/A | SaaS exempt in IL |
| **Michigan** | YES | 6% | $100K / 200 txns | Monitor sales volume |

### School District Exemptions (Indiana)

**Form ST-105 (General Sales Tax Exemption Certificate):**
- Indiana public school districts are generally exempt from sales tax
- **MUST collect Form ST-105** from each district before applying exemption
- Valid for 5 years from date of signature
- Retain copies in `/documents/tax/st105_certificates/`
- If no ST-105 on file → charge 7% sales tax

**Exempt Organizations:**
- Public school districts (with ST-105)
- Charter schools (if 501(c)(3) or government entity)
- Private schools (only if 501(c)(3), with ST-105)

### Hardware vs SaaS Invoice Separation

**Critical:** Separate Pico 4 hardware from SaaS subscription on all invoices.

| Line Item | Tax Treatment | Rate |
|-----------|---------------|------|
| LTVR SaaS Subscription | Taxable (unless ST-105) | 7% IN |
| Pico 4 Headset Hardware | Taxable tangible property | 7% IN |
| Teacher Training Services | Non-taxable (standalone service) | 0% |
| ArborXR Management (SaaS) | Taxable (unless ST-105) | 7% IN |

**Best Practice:** Use separate line items for hardware, software subscription, and services. Never bundle into a single line — this avoids over-taxing non-taxable services.

### Multi-State Nexus Tracker

| State | Economic Nexus | Current LTVR Sales | Nexus Status | Action |
|-------|---------------|-------------------|--------------|--------|
| Indiana | $100K / 200 txns | Active | CROSSED | Collecting 7% |
| Ohio | $100K / 200 txns | Monitoring | BELOW | Register when approaching $80K |
| Illinois | $100K | Monitoring | BELOW | SaaS exempt — no collection needed |
| Michigan | $100K / 200 txns | Monitoring | BELOW | Register when approaching $80K |

### LTVR R&D Qualifying Activities

The following Learning Time VR development activities qualify for R&D tax credits:
- **WebXR tablet platform adaptation** — adapting VR experiences for browser-based delivery
- **AI Lesson Generator development** — NLP/ML model for automated lesson plan creation
- **ArborXR integration development** — custom integration for LTVR-specific device management
- **VictoryXR content customization** — adapting content for specific educational outcomes
- **FERPA analytics system** — building compliant student data privacy controls
- **Adaptive learning algorithms** — ML models that adjust content difficulty based on performance

---

## 💻 INDIANA RESEARCH & DEVELOPMENT (R&D) TAX CREDIT

### Indiana R&D Credit:
- **Rate:** 15% of qualified research expenses (QREs)
- **Refundable:** No (carry forward 10 years)
- **Transferable:** No
- **Forms:** Schedule IT-20RDC (attach to IT-20 or IT-20S)

### Eligibility:
Must claim federal R&D credit (Form 6765) to claim Indiana credit

### Calculation:
```
Federal R&D Credit:            $10,000
× 15%
= Indiana R&D Credit:          $1,500

Can offset Indiana income tax
Unused credits carry forward 10 years
```

### Documentation:
Same as federal R&D requirements:
- Time tracking
- Project descriptions
- Technical uncertainty
- Process of experimentation

---

## 🏢 BUSINESS PERSONAL PROPERTY TAX

### What is Taxed:
- Equipment
- Furniture
- Computers
- Software licenses (perpetual, not SaaS)
- Leasehold improvements

### What is Exempt:
- Inventory
- SaaS subscriptions (not capitalized)
- Real estate
- Licensed vehicles (separate tax)

### Assessment:
- **Assessment Date:** January 1 each year
- **Filing Deadline:** May 15
- **Form:** Form 103 (Business Tangible Personal Property Return)
- **File With:** County assessor where property located

### Tax Rate:
- Varies by county (typically 2-3% of assessed value)
- Paid in two installments (May and November)

### Hamilton County Example (Fishers, IN):
- Assessment: 100% of depreciated value
- Tax Rate: ~2.5% (varies by township)
- $10,000 equipment → ~$250/year tax

### Compliance:
- File Form 103 annually by May 15
- Report all assets owned on Jan 1
- Depreciate per state schedule
- Pay tax bills when due

---

## 💰 UNEMPLOYMENT INSURANCE TAX

### Registration:
- **Required:** Once you have employees (including S-Corp owner on payroll)
- **Online:** DWD.IN.gov
- **Phone:** 1-800-891-6499

### Tax Rate:
- **New Employer:** 2.5% (first 3 years)
- **Experience Rated:** 0.5% - 7.4% (after 3 years)
- **Based on:** Unemployment claims history

### Wage Base:
- **2026:** First $14,000 of each employee's wages

### Filing:
- **Form:** UI-3 (Quarterly Wage Report)
- **Due:** Last day of month following quarter
- **Online:** Uplink (DWD.IN.gov)

### Employee vs. Contractor:
**Indiana uses ABC Test for unemployment:**
- **A:** Free from control/direction
- **B:** Outside usual course of business
- **C:** Independently established trade

Must meet ALL three to be contractor. Otherwise = employee.

---

## 📋 WITHHOLDING TAX

### Registration:
- **Required:** Once you have employees
- **Online:** INTIME.in.gov
- **Account:** Withholding Tax Account

### Rates:
- **State:** 3.23% (flat rate)
- **Counties:** Some counties have additional withholding
  - Marion County: 1.62% additional
  - Most others: 0% additional

### Filing:
- **Form:** WH-1 (Withholding Tax Return)
- **Frequency:**
  - Monthly: If withholding >$1,000/month
  - Quarterly: If withholding <$1,000/month
- **Due:** 30 days after period ends

### Year-End:
- **Form:** WH-3 (Annual Reconciliation)
- **Due:** January 31
- **W-2s:** Due to employees by January 31

---

## 🏠 INDIANA RESIDENCY RULES

### Full-Year Resident:
- Domiciled in Indiana
- File Form IT-40
- Taxed on worldwide income

### Part-Year Resident:
- Moved in or out during year
- File Form IT-40PNR
- Taxed on income while resident

### Non-Resident:
- Domiciled elsewhere
- Indiana-sourced income only
- File Form IT-40PNR

### Indiana-Sourced Income:
- Wages for work performed in Indiana
- Business income from Indiana operations
- Rental property in Indiana
- Sale of Indiana real estate

---

## 📅 INDIANA TAX CALENDAR (2026)

### January
- **Jan 31:** Issue W-2s and 1099s to recipients

### February
- **Feb 2:** File W-2s and 1099s with Indiana

### March
- **Mar 15:** S-Corp returns (IT-20S) due
- **Mar 15:** Partnership returns (IT-65) due
- **Mar 31:** Q4 2025 withholding (WH-1) due

### April
- **Apr 15:** Individual returns (IT-40) due
- **Apr 15:** C-Corp returns (IT-20) due
- **Apr 30:** Q1 2026 withholding (WH-1) due
- **Apr 30:** Q1 2026 unemployment (UI-3) due

### May
- **May 15:** Personal property tax returns (Form 103) due
- **May 15:** Q1 2026 sales tax due (if monthly filer)

### June
- **Jun 30:** Q1 2026 sales tax due (if quarterly filer)

### July
- **Jul 31:** Q2 2026 withholding (WH-1) due
- **Jul 31:** Q2 2026 unemployment (UI-3) due

### August
- **Aug 20:** Q2 2026 sales tax due (if monthly filer)

### September
- **Sep 15:** Extended S-Corp returns due
- **Sep 30:** Q2 2026 sales tax due (if quarterly filer)

### October
- **Oct 15:** Extended individual returns due
- **Oct 15:** Extended C-Corp returns due
- **Oct 31:** Q3 2026 withholding (WH-1) due
- **Oct 31:** Q3 2026 unemployment (UI-3) due

### November
- **Nov 10:** Pay personal property tax (1st installment)

### December
- **Dec 31:** Tax year ends

---

## 🌟 INDIANA BUSINESS INCENTIVES

### Hoosier Business Investment (HBI) Tax Credit
- **For:** Job creation, capital investment
- **Credit:** Up to 50% of corporate tax liability
- ** refundable:** No (10-year carryforward)
- **Contact:** IEDC (Indiana Economic Development Corporation)

### Headquarters Relocation Credit
- **For:** Relocating HQ to Indiana
- **Credit:** 50% of relocation costs
- **Max:** $5M over 10 years

### Venture Capital Investment Credit
- **For:** Investing in Indiana startups
- **Credit:** 20% of investment
- **Max:** $1M per year

### Research & Development Credit
- As detailed above (15% of federal credit)

### EDGE Tax Credit
- **For:** Job creation
- **Credit:** Percentage of payroll tax withholding
- ** refundable:** Yes

---

## ⚠️ COMMON INDIANA TAX MISTAKES

1. **Not registering for sales tax** until after nexus threshold crossed
2. **Missing personal property filing** (Form 103) - penalties apply
3. **Filing unemployment late** - interest and penalties
4. **Not withholding county tax** (Marion County)
5. **Missing R&D credit** - Indiana has generous credit
6. **Not updating business entity** with Secretary of State
7. **Failing to file zero sales tax returns** (if registered)

---

## 📞 INDIANA DEPARTMENT OF REVENUE CONTACTS

### General Information:
- **Phone:** 317-232-2240
- **Website:** IN.gov/dor
- **INTIME:** INTIME.in.gov (online portal)

### Specific Programs:
- **Sales Tax:** 317-615-2630
- **Income Tax:** 317-232-2240
- **R&D Credits:** 317-615-2543
- **Business Incentives:** 317-232-8822

### Mailing Addresses:
- **Sales Tax:** Indiana Department of Revenue, P.O. Box 7224, Indianapolis, IN 46207-7224
- **Income Tax:** Indiana Department of Revenue, P.O. Box 40, Indianapolis, IN 46206-0040

### Local County:
**Hamilton County (Fishers):**
- **Assessor:** 317-776-9610
- **Treasurer:** 317-776-9630

---

## ✅ INDIANA TAX COMPLIANCE CHECKLIST

### Upon Starting Business:
- [ ] Register with Secretary of State (if LLC/Corp)
- [ ] Obtain EIN from IRS
- [ ] Register for Indiana withholding (if employees)
- [ ] Register for unemployment insurance (if employees)
- [ ] Monitor sales for Indiana nexus
- [ ] Register for sales tax (when nexus triggered)

### Monthly (if applicable):
- [ ] File sales tax (if monthly filer)
- [ ] Deposit withholding (if monthly filer)
- [ ] Run payroll (if S-Corp or employees)

### Quarterly:
- [ ] File withholding (WH-1)
- [ ] File unemployment (UI-3)
- [ ] File sales tax (if quarterly filer)
- [ ] Pay quarterly estimates (federal and state)

### Annually:
- [ ] File personal property tax (Form 103) - May 15
- [ ] File income tax returns (April 15)
- [ ] Reconcile withholding (WH-3) - Jan 31
- [ ] Issue W-2s and 1099s - Jan 31
- [ ] Review R&D credit eligibility

---

**Document Owner:** Financial Agent (CPA)  
**Primary State:** Indiana (Fishers/Hamilton County)  
**Also See:**
- Multi-State Sales Tax Guide (for Ohio, Illinois, Michigan)
- Federal Tax Quick Reference
- Entity Comparison Matrix

**Last Updated:** February 3, 2026  
**Next Review:** Quarterly (April, July, October, January)
