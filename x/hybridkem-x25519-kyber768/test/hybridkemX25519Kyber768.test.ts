// import { assertEquals, assertRejects } from "testing/asserts.ts";
import { assertEquals } from "testing/asserts.ts";
import { describe, it } from "testing/bdd.ts";

import {
  AeadId,
  Aes128Gcm,
  CipherSuite,
  HkdfSha256,
  KdfId,
  KemId,
} from "../../../core/mod.ts";
import { Kyber768 } from "../../../src/kems/pqkemPrimitives/kyber768.ts";
import { DhkemX25519HkdfSha256 } from "../../../src/kems/dhkemX25519.ts";
import { hexToBytes } from "../../../test/utils.ts";
import { HybridkemX25519Kyber768 } from "../mod.ts";

describe("constructor", () => {
  describe("with HybridkemX25519Kyber768", () => {
    it("should have a correct ciphersuite", () => {
      const suite: CipherSuite = new CipherSuite({
        kem: new HybridkemX25519Kyber768(),
        kdf: new HkdfSha256(),
        aead: new Aes128Gcm(),
      });
      assertEquals(suite.kem.secretSize, 64);
      assertEquals(suite.kem.encSize, 1120);
      assertEquals(suite.kem.publicKeySize, 1216);
      assertEquals(suite.kem.privateKeySize, 2432);

      // assert
      assertEquals(suite.kem.id, KemId.HybridkemX25519Kyber768);
      assertEquals(suite.kem.id, 0x0030);
      assertEquals(suite.kdf.id, KdfId.HkdfSha256);
      assertEquals(suite.kdf.id, 0x0001);
      assertEquals(suite.aead.id, AeadId.Aes128Gcm);
      assertEquals(suite.aead.id, 0x0001);
    });
  });
});

describe("README examples", () => {
  describe("HybridkemX25519Kyber768/HkdfShar256/Aes128Gcm", () => {
    it("should work normally", async () => {
      const suite = new CipherSuite({
        kem: new HybridkemX25519Kyber768(),
        kdf: new HkdfSha256(),
        aead: new Aes128Gcm(),
      });
      const rkp = await suite.kem.generateKeyPair();
      const sender = await suite.createSenderContext({
        recipientPublicKey: rkp.publicKey,
      });
      const recipient = await suite.createRecipientContext({
        recipientKey: rkp,
        enc: sender.enc,
      });
      assertEquals(sender.enc.byteLength, suite.kem.encSize);

      // encrypt
      const ct = await sender.seal(
        new TextEncoder().encode("my-secret-message"),
      );

      // decrypt
      const pt = await recipient.open(ct);

      // assert
      assertEquals(new TextDecoder().decode(pt), "my-secret-message");
    });
  });
});

const testVector = {
  mode: 0,
  kem_id: 48,
  kdf_id: 1,
  aead_id: 1,
  info: "486561722068656172",
  ikmR: "3cb1eea988004b93103cfb0aeefd2a686e01fa4a58e8a3639ca8a1e3f9ae57e2",
  pkRm:
    "a3aa882fee0de0059cec0569c8e1b4872fb6cb4d82361b72ee1148dc7ddc0c2b210747403222b16597f4881d694c12366c53fde2b3d346b7ee87b16dd42f44ec594cea6ba78b256092cbbc16baaf6ccc46f2386da22de9d142f593739eb9c245018e0c61975514ac42639d3c5b0299b772acd59d55520a5d660f135075e33a673fd5b9e2d56803889fc62b0362f8cbe9990cb36b4cdef17586c8cc58d72d84fb9398f1c1efb0a6282508083c23965a9851acb89afc723e7a6c60bc4007a41ad1950c4590a2f8d2bb3b832f5db1707ad8bad1c4c426aaa7da97b34a921283415851f19b0f01ca3924754dba6596f9329454b1e3d9b5f357a66c59bf5fc4a045908b5eb107d3302f0cb9be0af9584846c1475b92d3c16051935dc7411acaa64c80c836b0643fd72b38cb0a33feb11f4813b66f705268b3838b8974e28c12b4f9bbc8623c936b32a015262d4a33172b7f3a69b6c2fab5a3c18ffdab2927e77598d1556d51a8559550c251796290b617ac9804167bd9a76e9d8bba64059d165acfe2483e9ed0cbc11cb71dd148776aa1cb862ce2b1026e773600d101a300671a70710a877a5c1732275c362085b2b8cc66206b3ec37c82ac873d1ec1862a8aa457fc9776960b396c23768c931cdc77731792c569c2088c52ddb5cc0c90ab9187c1e0ca2c98818859aa86fe44801be483cc1469d636cd3e019267c1cc684640359ca67c5abd1dc100c4d3c5924acf1b988d3b5019e7b06ef238412b7608dd23115c6047a59b4b1d7a731126925728c645c140aa4704c1b808b6c401be736bf18bb7d654342c6576236565c6c5b0727b25ae773c5fb76be794304dc1b672aa5909659b6bb8a1f430a141882b0f9753662794e625885782154dc148e632b6b2079087958d83c6c82cf55a47eb4ed819a409d94ceb0c74e8d497b95975a0a5c659f5bf0a033d2adca98a693304413fff95342319a09fd62f263b91a2c6540d2196dd2ba90dd113042428aeeb15156c03949660776b80bc1501b0d80a946a623906291ed3668f3c99c1889d3ae3c59819c38f6b0c46558c2ca520c2107c166452b917cea53bb50c4cb839a99f60e54e9236c6a419a8de5508f4e3545409499b97939ee940a9d48ed5547003350e391b4c96d657cb395b5c035370e9c8ece32c83b3cff347ca16bb1e2943669f370f48e70462d4369a07804bc09fcf399bc2d11b47b0370660916944a179423519a310cc0737407c55ef09255530c7ec817999c95e20aa23f8f6782aa820d34c89c2299ff0ec9a9021b6f7dbbd19503fa6f170d8770e12875d558bbb2ca66fd1136e0e5729ef30346109cd289a1ce0c531a493581ed64533e1749fc818b85ab664255bbfe4a641f6bdf43ac1695c28ab2b58b3bab5bed5893439455b669b63d65ceff75b8c5857f4ba5cf767cf57aa8e28691cc6dc67fca434e3b1560c6c53ce37c2a2f14764c1cf1e5697cd8757a544b05b766f4400cef7ecc46ec29a1d679d7fe385c4366579db06d1d840c9911fab8b6b5df2035cb95410f79b861411b4eb5a4119208f8872674639617452f6b6394c94c6d6f5b833690dd98406b5e7c0827b1a3617a03ba90c3d185a954252f1ba5b157a3f61749548e281fc543dec205e757932bcc717b99b7df7123500f3bcc660c080093b3fbac56ff51b9c3b037f76e3f43c0e46b5588cf617f4de85044390a9947daacba87cd5",
  skRm:
    "cf61f1a7b05c83f9c2a4b27dc0e9bdbf4e52ba1bbd906cb3776ac12268a9f4d0c348342d192f0458ab53d19c1dc135d11b48978c878bca6d7d1bc91428259e43aadc9700b76aa9aa66a65db91a77d72513e40697226557b53400bb6752fb4e11a5ba2fe12644698a48c9948ec121cc9c9ce7384c65f798012c9df8f5ac0cd371d7d19d9a24c30cb0909c665e43c89328735fe95a62653352fad3cfe6330b436a4f72c9ac9323babd912cf5970222eb0dd178c810bcc79beba0813039ec4333c33b13d4cc5183b6b14dc09cb9604d46242353a1a1df82999e4a4929f28f498c330d552ac64156cf123cceebbccf81b2fd86218f2a9112040943a359d7a858cd641467e54b25f03d66b9a150fbcf3f19bbd1791abec47269b2a72f4083a79c2559fbb6d0500208a78baa7392874443c39c38577b4c40db6220ca5c84b148ffb344164c723df1c0fb37ae52c0854bea023e2a45efaa8869c924ecf360008607e7079187978fdac30e8b76a3110349de272b25f5490dc87e3d8caf59a5a51a57230ea702dfda0f5d2c0fe94442254834b0f6aa71852601a8c5b7b211f108c1de2b1092e9b89df4a9feea882aa00ab97235940924e8a81d8f83597f72383f7a1b99c3c8481953be917fef0b44e32b0aa1f862eedc8d0d94030ae92e73097cde1b34de9b8279293322e0b5f9564395cb4998810818544ad2025018c40debf0b97bca2f1d861f8d5b51a2a84f35503cb37112b280ad0a4c99a2eb9c43300ce7c66eb89cb4443a44edc40869b8c2d90c5d484554557c408da7b46752bec14876815334b783207f60943d1738b5183d64394e27bb8f1dbb6ed9c58aa338171967bf5a613e9194c13395573615cee02012438a68aa104afd56a943d05caefc7f20a0104e2cced2a5191a1a68fe431920e1844a8154fc42a73d70c82f26846ec332fda50c340c1c5037965daaccd3cacfcab3c85a7516d712890fd6a2b1f5cb7c745cf1798dc0a49ed75717630c78d56bb8db272a85a009b2685ca9f4840c948226d224de1a0385565e569b8901c4508ae7b9214b88b6c2ac63807710d85e593a01ba20541cd03fa8364b4cb79f110745b30818521a7d0b6015a20483dde33188e94fc4aa224558bd53d384a9f6916964bbef0b0770b11e7b4117f41639bbe0c9ce119c8f8aab451608c2f06a8cd85f37519b7e3c1f9f07a6449059a972260cf80c23e52fe1b559e11c723b2618752672bfab67305358e7f048960475f1c720d8ba5fe4883981065c462c5062757bddd2666de67265990d0053229693a8bfd8811c84494853095c875639dcbcfcc02785910e35643f5bb4b0aa59af7a86ae94dcc01f952eb1d151c4ba1aa4da02c100b461904229f7b11aac35d307ab187255baa32eed32b3b262aaf2db6019089ad4250079280a0efb109ab27a364135ac3067ace5c82dea1fafb04dfedba9fabc196832878eb7b4314556e8aa8210e2c72959723e23176b703d4db42aabba62229790f6a743a2ec3c43dc8dbe0b4c36dc2323ec0ef21c116941b43bb12763460eed032a7a039185e36dcbf69d88f645e6728d3ba79dae0a25ddd4c3a8bba8334aa8fb6658a9dca99a8cc6362745d6080b0fd8af6af71e9f752d7b763035ec40c0fc98326081ea4c36cdf992e73a16719b9fb7c06e6c1bb7210747403222b16597f4881d694c12366c53fde2b3d346b7ee87b16dd42f44ec594cea6ba78b256092cbbc16baaf6ccc46f2386da22de9d142f593739eb9c245018e0c61975514ac42639d3c5b0299b772acd59d55520a5d660f135075e33a673fd5b9e2d56803889fc62b0362f8cbe9990cb36b4cdef17586c8cc58d72d84fb9398f1c1efb0a6282508083c23965a9851acb89afc723e7a6c60bc4007a41ad1950c4590a2f8d2bb3b832f5db1707ad8bad1c4c426aaa7da97b34a921283415851f19b0f01ca3924754dba6596f9329454b1e3d9b5f357a66c59bf5fc4a045908b5eb107d3302f0cb9be0af9584846c1475b92d3c16051935dc7411acaa64c80c836b0643fd72b38cb0a33feb11f4813b66f705268b3838b8974e28c12b4f9bbc8623c936b32a015262d4a33172b7f3a69b6c2fab5a3c18ffdab2927e77598d1556d51a8559550c251796290b617ac9804167bd9a76e9d8bba64059d165acfe2483e9ed0cbc11cb71dd148776aa1cb862ce2b1026e773600d101a300671a70710a877a5c1732275c362085b2b8cc66206b3ec37c82ac873d1ec1862a8aa457fc9776960b396c23768c931cdc77731792c569c2088c52ddb5cc0c90ab9187c1e0ca2c98818859aa86fe44801be483cc1469d636cd3e019267c1cc684640359ca67c5abd1dc100c4d3c5924acf1b988d3b5019e7b06ef238412b7608dd23115c6047a59b4b1d7a731126925728c645c140aa4704c1b808b6c401be736bf18bb7d654342c6576236565c6c5b0727b25ae773c5fb76be794304dc1b672aa5909659b6bb8a1f430a141882b0f9753662794e625885782154dc148e632b6b2079087958d83c6c82cf55a47eb4ed819a409d94ceb0c74e8d497b95975a0a5c659f5bf0a033d2adca98a693304413fff95342319a09fd62f263b91a2c6540d2196dd2ba90dd113042428aeeb15156c03949660776b80bc1501b0d80a946a623906291ed3668f3c99c1889d3ae3c59819c38f6b0c46558c2ca520c2107c166452b917cea53bb50c4cb839a99f60e54e9236c6a419a8de5508f4e3545409499b97939ee940a9d48ed5547003350e391b4c96d657cb395b5c035370e9c8ece32c83b3cff347ca16bb1e2943669f370f48e70462d4369a07804bc09fcf399bc2d11b47b0370660916944a179423519a310cc0737407c55ef09255530c7ec817999c95e20aa23f8f6782aa820d34c89c2299ff0ec9a9021b6f7dbbd19503fa6f170d8770e12875d558bbb2ca66fd1136e0e5729ef30346109cd289a1ce0c531a493581ed64533e1749fc818b85ab664255bbfe4a641f6bdf43ac1695c28ab2b58b3bab5bed5893439455b669b63d65ceff75b8c5857f4ba5cf767cf57aa8e28691cc6dc67fca434e3b1560c6c53ce37c2a2f14764c1cf1e5697cd8757a544b05b766f4400cef7ecc46ec29a1d679d7fe385c4366579db06d1d840c9911fab8b6b5df2035cb95410f79b861411b4eb5a4119208f8872674639617452f6b6394c94c6d6f5b833690dd98406b5e7c0827b1a3617a03ba90c3d185a954252f1ba5b157a3f61749548e281fc543dec205e757932bcc717b99b7df7123500f3bcc660c080093b3fbac56ff51b9c3b037f76e3f43c0e46b5588cf617f4de85044390a9947daacba87cd5137b60651b30bf805da1597faef1bc8b2645cda273144c4af1d13eaa2ad9101c7b58b14601aff81754afc776f8b7f7b9324d420b66706b96ea7f99f8fa11bed3",
  ier:
    "35b8cc873c23dc62b8d260169afa2f75ab916a58d974918835d25e6a435085b2badfd6dfaac359a5efbb7bcc4b59d538df9a04302e10c8bc1cbf1a0b3a5120ea",
  enc:
    "1d06980e46fd3842db6b87226231eedd2cc9684ee98a1d9d902bd9300e2c4d41b64fba47a50fe32dd0df3b0a75801c11022cd98a6ff5a83a8472ade82bdd6f1e8a65a94a88523ada0d8275165f707f1067a6a576e54525d9141e95223f5713456bda7ec5eb558adfc6b7f0d80de46222579a3274e45ab43fad14f7e9855a872d2716e8dc78d4c12027bef3184904476c8961552fd031361358f2d9deae8ad98194047a14222947612972574c57514266e9e67a3b6dd89972cc8a0882be7474f4923549dfcd944dcbe58b088079aa8b70c8f291cb4e45066bad4a832ccd8f40e51861f7a25b6a2358842f1bbe8108a6a6f0ae93153a2e7f9f53e180a90532531a632367b81bf08ed97effcf0140dd0e92cc438f6be7e6f3d97a9f7787f7e3981f971617f0bfb618caa7db1e453f33a386c3863b16d462229c41f4946b49e4e49c27e0f35d77e21304b6ad238a55a51e9e370dd39e713d626044fb970bb7c2af7d7b9cb9004394741a0ea2de592816359006f24abdfc2aa890720b00b2f7b8bb240120f22bdb84f9fc5c8fdc7ca7047ae633868c184c4d75e9e107eb9c6d8fe879415926457d818bc31e88b87a5881584a5650859e88b06faa2cfe1bde95dfa344af14f214cedecde4d89c87334c33e2d7ee3ab40d5df396cf0ff5a99588e0dcd205f1d876b380b963f5baccc0baeae569892a8d252f5eeeb7c751f663eb906ac99a165656224281add3ab271ff4f406b6932cbf1afff62109794f52ff3e723f5cdd706e3715d1d2d421bdac73fa047b5d9761569534fb2dd57b86a608f79db7d4ab99847490e76eaf0c683bdc54d12f2f2664a79de6a2f25bec3f43584f98ec41ad3fb19ba5ba936c3c893e9c0994b412ba3d07329086c20b04e1cd1d9b4f24a82f8c1f7b5db58b4056a4b4e27b60c957f5af8081bffab98d8455cab97e35042ed636c995931fd304b3d02fcf545df360cc421be64adc3d7a121ea75ab3440a9eba74fba1c5b40bdb66b54583ff2f76304ccaeae99ed94fb332d30d771fe0e45acb9e966f497b1629f5a5df15cea507d2fd1aa045a171e84bec932e4049639477f16fb9afdd107668f9b3531c3c7eb1d67753ac652c575b526e6f2965f1e4500e99f38ae1d34bce151a68e278f14405ad76f580b549d025b03be98b6a737f10238b9f84f1694173544ba2c97f811a17485129a146084bc5382e2086aaf51b11a4918bdb5485bf28a9be2d2c9d69468268fa04fa071c39942b43a0caf561278cfc1b47781fa9ef559f86b2dad703141b78b7ddb35c9c9ff4c1134580da26367dbf3db7eaf039dfbae238959c4cf55d40d78a2c5597ba038f2be5f994d60c79e8a92121fb0488eef9690d550ef9fa40b1774221aac8c8c1dcf97faa07c28e840feb9daf0bf3bed277a6e10a33490c0bee7e5fa318638f5b80a2272700e591ffc14985d0ed19876725c2bec9356b45ca96d295e30bce86effc626a2bd7839af05ae373801af510cfb378ce42088607909c91ceb4a90e4d7b2b6288b9cdfa262570ffda8692b58f0b05a7c7899a717a3a97b6e64489f56323b000793f807ca75ca991",
  shared_secret:
    "1368d71518fadbe42fb75fbd356e016b0aaad6b4d3d91ce7f207073e4fb08c537217aba238aea92a7f855820518a8342b3a31f82ebbcdb479f33ad82bdcdc953",
  key_schedule_context:
    "009f749a195d1c8b3eaa8d5c3f571dc7231aafbbc0405e4b484738352667c484867584e32e844cdf74d17b4ee224cc521bbc8bed221f21f34f8ccc9842772686cb",
  secret: "95f863934be4d0ef683770c7bd385839d19e525b467a332f47ae715c54183e1d",
  key: "6bb5532badb078ce8f326daa6cfaef84",
  base_nonce: "ff2b9a604a84754614e9e772",
  exporter_secret:
    "fb6ca36cfb7881cf11dbcb8fde201f698f80d0b941b642bc0a6a3101c97b7fad",
};

describe("test-vectors", () => {
  describe("Base/Hybridkem/X25519Kyber768/HkdfSha256/Aes128Gcm", () => {
    it("should work normally", async () => {
      const suite = new CipherSuite({
        kem: new HybridkemX25519Kyber768(),
        kdf: new HkdfSha256(),
        aead: new Aes128Gcm(),
      });

      const info = hexToBytes(testVector.info);
      const ikmR = hexToBytes(testVector.ikmR);
      const pkRm = hexToBytes(testVector.pkRm);
      const skRm = hexToBytes(testVector.skRm);

      // DeriveKeyPair
      const rkp = await suite.kem.deriveKeyPair(ikmR);
      const pkR = new Uint8Array(
        await suite.kem.serializePublicKey(rkp.publicKey),
      );
      const skR = new Uint8Array(
        await suite.kem.serializePrivateKey(rkp.privateKey),
      );
      assertEquals(skR, skRm);
      assertEquals(pkR, pkRm);

      const enc = hexToBytes(testVector.enc);
      const sharedSecret = hexToBytes(testVector.shared_secret);
      const ier = hexToBytes(testVector.ier);

      // encap
      const dhkem = new DhkemX25519HkdfSha256();
      const ekpA = await dhkem.deriveKeyPair(ier.subarray(0, 32));
      const pkRA = await dhkem.deserializePublicKey(pkR.subarray(0, 32));
      const senderA = await dhkem.encap({
        info: info,
        recipientPublicKey: pkRA,
        nonEphemeralKeyPair: ekpA,
      });
      assertEquals(new Uint8Array(senderA.enc), enc.subarray(0, 32));
      assertEquals(
        new Uint8Array(senderA.sharedSecret),
        sharedSecret.subarray(0, 32),
      );
      const kyber = new Kyber768();
      const res = kyber.encap(pkR.subarray(32), ier.subarray(32));
      assertEquals(res[0], enc.subarray(32));
      assertEquals(res[1], sharedSecret.subarray(32));

      // decap
      const ss = kyber.decap(enc.subarray(32), skR.subarray(32));
      assertEquals(new Uint8Array(ss), sharedSecret.subarray(32));
      // const sender = await suite.createSenderContext({
      //   recipientPublicKey: rkp.publicKey,
      // });

      // const recipient = await suite.createRecipientContext({
      //   recipientKey: rkp,
      //   enc: sender.enc,
      // });
      // assertEquals(sender.enc.byteLength, suite.kem.encSize);

      // // encrypt
      // const ct = await sender.seal(
      //   new TextEncoder().encode("my-secret-message"),
      // );

      // // decrypt
      // const pt = await recipient.open(ct);

      // // assert
      // assertEquals(new TextDecoder().decode(pt), "my-secret-message");
    });
  });
});
