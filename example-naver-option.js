
/**
 * 네이버 커머스 API - 상품 옵션 조회 예제
 * 
 * 이 파일은 특정 상품의 옵션 정보를 조회하고 파싱하는 방법을 보여주는 예제입니다.
 * '채널 상품 조회 API (V2)'를 통해 상세 정보를 가져온 후, 
 * 'originProduct.detailAttribute.optionInfo' 필드를 분석합니다.
 */

import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { NaverCommerceAPI } from './src/services/naver-commerce.js';

// .env 파일 로드 (API 키 정보: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET 등)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

async function getProductOptionExample(productId) {
    // 1. 네이버 커머스 API 클라이언트 초기화
    // 실제 운영 환경에서는 DB에서 해당 고객의 API 키를 가져옵니다.
    const CLIENT_ID = process.env.NAVER_CLIENT_ID;
    const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error('.env 파일에 NAVER_CLIENT_ID 및 NAVER_CLIENT_SECRET이 설정되어야 합니다.');
        return;
    }

    const naverAPI = new NaverCommerceAPI(CLIENT_ID, CLIENT_SECRET);

    console.log(`🔍 상품 옵션 조회 시작 (Product ID: ${productId})`);

    try {
        // 2. 채널 상품 상세 정보 조회 (V2 API 사용)
        // 이 메서드는 내부적으로 https://api.commerce.naver.com/external/v2/products/channel-products/{id} 를 호출합니다.
        const productDetail = await naverAPI.getChannelProductDetail(productId);

        if (!productDetail) {
            console.error('상품 정보를 가져올 수 없습니다. ID가 정확한지, 판매중인 상품인지 확인해주세요.');
            return;
        }

        console.log(`상품명: ${productDetail.name}`);

        // 3. 옵션 정보 추출 (핵심 데이터 경로)
        const optionInfo = productDetail.originProduct?.detailAttribute?.optionInfo;

        if (!optionInfo) {
            console.log('ℹ️ 이 상품은 설정된 옵션이 없는 단품 상품입니다.');
            return;
        }

        console.log('\n--- [원본 옵션 데이터 구조] ---');
        console.log(JSON.stringify(optionInfo, null, 2));

        // 4. 옵션 유형별 데이터 확인 예제
        console.log('\n--- [유형별 옵션 파싱 결과] ---');

        // (1) 단독형 옵션 (optionSimple)
        if (optionInfo.optionSimple && optionInfo.optionSimple.length > 0) {
            console.log('[단독형 옵션]');
            optionInfo.optionSimple.forEach(opt => {
                console.log(`  - ${opt.groupName}: ${opt.name} (ID: ${opt.id})`);
            });
        }

        // (2) 조합형 옵션 (optionCombinations)
        if (optionInfo.optionCombinations && optionInfo.optionCombinations.length > 0) {
            console.log('[조합형 옵션]');
            const groupNames = optionInfo.optionCombinationGroupNames || [];
            console.log(`  - 옵션 항목명: ${groupNames.join(', ')}`);

            optionInfo.optionCombinations.forEach(combo => {
                console.log(`  - 조합: ${combo.optionName} (ID: ${combo.id}, 재고: ${combo.stockQuantity}개)`);
            });
        }

        // (3) 직접 입력형 옵션 (optionCustom)
        if (optionInfo.optionCustom && optionInfo.optionCustom.length > 0) {
            console.log('[직접 입력형 옵션]');
            optionInfo.optionCustom.forEach(custom => {
                console.log(`  - ${custom.groupName} (글자수 제한: ${custom.inputLimit}자)`);
            });
        }

        // (4) 표준형(색상/사이즈) 옵션
        if (optionInfo.optionStandards && optionInfo.optionStandards.length > 0) {
            console.log('[표준형 옵션]');
            optionInfo.optionStandards.forEach(std => {
                console.log(`  - ${std.optionName || std.standardOptionName} (ID: ${std.id})`);
            });
        }

        // 5. NaverCommerceAPI에 내장된 파싱 메서드 사용 결과
        console.log('\n--- [내장 메서드 파싱 결과] ---');
        const parsed = naverAPI.parseOptionInfo(optionInfo, productId);
        console.log(JSON.stringify(parsed, null, 2));

    } catch (error) {
        console.error('❌ 조회 중 오류 발생:', error.message);
    }
}

// 테스트 실행 (사용자 요청 상품 ID: 1234567890)
const TARGET_PRODUCT_ID = '1234567890';
getProductOptionExample(TARGET_PRODUCT_ID);
