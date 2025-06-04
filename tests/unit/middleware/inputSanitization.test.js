import { expect } from 'chai';
import {
    sanitizeHtml,
    escapeXss,
    sanitizeSql,
    sanitizeNoSql,
    createSanitizationMiddleware,
    sanitizeFields
} from '../../../src/common/middleware/inputSanitization.js';

describe('Input Sanitization Middleware', () => {
    describe('sanitizeHtml', () => {
        it('should remove dangerous HTML tags', () => {
            const input = '<script>alert("xss")</script><p>Safe content</p>';
            const result = sanitizeHtml(input, true);

            expect(result).to.not.include('<script>');
            expect(result).to.include('Safe content');
        });

        it('should completely remove HTML when allowHtml is false', () => {
            const input = '<p>Some <strong>content</strong></p>';
            const result = sanitizeHtml(input, false);

            expect(result).to.not.include('<p>');
            expect(result).to.not.include('<strong>');
            expect(result).to.include('Some content');
        });

        it('should preserve safe HTML tags when allowHtml is true', () => {
            const input = '<p>Safe <strong>content</strong></p>';
            const result = sanitizeHtml(input, true);

            expect(result).to.include('<p>');
            expect(result).to.include('<strong>');
            expect(result).to.include('Safe content');
        });

        it('should handle non-string input', () => {
            expect(sanitizeHtml(123)).to.equal(123);
            expect(sanitizeHtml(null)).to.equal(null);
            expect(sanitizeHtml(undefined)).to.equal(undefined);
        });
    });

    describe('escapeXss', () => {
        it('should escape dangerous characters', () => {
            const input = '<script>alert("xss")</script>';
            const result = escapeXss(input);

            expect(result).to.include('&lt;script&gt;');
            expect(result).to.not.include('<script>');
        });

        it('should escape quotes and ampersands', () => {
            const input = 'Test "quotes" & ampersands';
            const result = escapeXss(input);

            expect(result).to.include('&quot;');
            expect(result).to.include('&amp;');
        });

        it('should handle non-string input', () => {
            expect(escapeXss(123)).to.equal(123);
            expect(escapeXss(null)).to.equal(null);
        });
    });

    describe('sanitizeSql', () => {
        it('should remove SQL injection patterns', () => {
            const input = "'; DROP TABLE users; --";
            const result = sanitizeSql(input);

            expect(result).to.not.include('DROP');
            expect(result).to.not.include('--');
            expect(result).to.not.include(';');
        });

        it('should remove SQL keywords', () => {
            const input = 'SELECT * FROM users WHERE 1=1';
            const result = sanitizeSql(input);

            expect(result).to.not.include('SELECT');
            expect(result).to.not.include('FROM');
        });

        it('should remove OR/AND injection patterns', () => {
            const input = "' OR 1=1 --";
            const result = sanitizeSql(input);

            expect(result).to.not.include('OR 1=1');
        });

        it('should handle safe input', () => {
            const input = 'Normal text content';
            const result = sanitizeSql(input);

            expect(result).to.equal('Normal text content');
        });
    });

    describe('sanitizeNoSql', () => {
        it('should remove MongoDB operators from strings', () => {
            const input = '$where function() { return true; }';
            const result = sanitizeNoSql(input);

            expect(result).to.not.include('$where');
        });

        it('should sanitize object keys', () => {
            const input = { $where: 'malicious', name: 'test' };
            const result = sanitizeNoSql(input);

            expect(result).to.have.property('where');
            expect(result).to.not.have.property('$where');
            expect(result).to.have.property('name', 'test');
        });

        it('should handle nested objects', () => {
            const input = {
                user: { $ne: null },
                data: { $regex: 'test' }
            };
            const result = sanitizeNoSql(input);

            expect(result.user).to.not.have.property('$ne');
            expect(result.data).to.not.have.property('$regex');
        });
    });

    describe('createSanitizationMiddleware', () => {
        let req, res, next;

        beforeEach(() => {
            req = {
                path: '/test',
                body: {},
                query: {},
                params: {},
                method: 'POST',
                url: '/test',
                ip: '127.0.0.1'
            };
            res = {};
            next = () => { };
        });

        it('should sanitize request body', (done) => {
            const middleware = createSanitizationMiddleware();
            req.body = {
                title: '<script>alert("xss")</script>Test Title',
                description: "'; DROP TABLE users; --"
            };

            middleware(req, res, () => {
                expect(req.body.title).to.not.include('<script>');
                expect(req.body.description).to.not.include('DROP');
                done();
            });
        });

        it('should sanitize query parameters', (done) => {
            const middleware = createSanitizationMiddleware();
            req.query = {
                search: '<img src=x onerror=alert(1)>',
                filter: 'SELECT * FROM users'
            };

            middleware(req, res, () => {
                expect(req.query.search).to.not.include('onerror');
                expect(req.query.filter).to.not.include('SELECT');
                done();
            });
        });

        it('should skip specified paths', (done) => {
            const middleware = createSanitizationMiddleware({
                skipPaths: ['/api-docs', '/health']
            });
            req.path = '/api-docs';
            req.body = { malicious: '<script>alert("xss")</script>' };

            middleware(req, res, () => {
                expect(req.body.malicious).to.include('<script>');
                done();
            });
        });

        it('should handle errors gracefully', (done) => {
            const middleware = createSanitizationMiddleware();
            // 순환 참조를 가진 객체로 에러 유발
            const circular = {};
            circular.self = circular;
            req.body = circular;

            middleware(req, res, () => {
                // 에러가 발생해도 next()가 호출되어야 함
                done();
            });
        });
    });

    describe('sanitizeFields', () => {
        let req, res, next;

        beforeEach(() => {
            req = {
                body: {},
                method: 'POST',
                url: '/test'
            };
            res = {};
            next = () => { };
        });

        it('should sanitize specified fields only', (done) => {
            const middleware = sanitizeFields(['title', 'description']);
            req.body = {
                title: '<script>alert("xss")</script>',
                description: "'; DROP TABLE users; --",
                safe_field: '<p>This should not be changed</p>'
            };

            middleware(req, res, () => {
                expect(req.body.title).to.not.include('<script>');
                expect(req.body.description).to.not.include('DROP');
                expect(req.body.safe_field).to.include('<p>');
                done();
            });
        });

        it('should handle nested field paths', (done) => {
            const middleware = sanitizeFields(['user.profile.bio']);
            req.body = {
                user: {
                    profile: {
                        bio: '<script>alert("xss")</script>Safe bio'
                    }
                }
            };

            middleware(req, res, () => {
                expect(req.body.user.profile.bio).to.not.include('<script>');
                expect(req.body.user.profile.bio).to.include('Safe bio');
                done();
            });
        });

        it('should handle missing fields gracefully', (done) => {
            const middleware = sanitizeFields(['nonexistent.field']);
            req.body = { title: 'Test' };

            middleware(req, res, () => {
                expect(req.body.title).to.equal('Test');
                done();
            });
        });
    });

    describe('Integration Tests', () => {
        it('should handle complex nested objects', () => {
            const input = {
                post: {
                    title: '<script>alert("xss")</script>Post Title',
                    content: 'Normal content with <p>safe HTML</p>',
                    metadata: {
                        tags: ['<script>tag1</script>', 'normal tag'],
                        author: "'; DROP TABLE users; --"
                    }
                },
                comments: [
                    { text: '<img src=x onerror=alert(1)>' },
                    { text: 'Normal comment' }
                ]
            };

            const middleware = createSanitizationMiddleware({ allowHtml: false });
            const req = { path: '/test', body: input, method: 'POST', url: '/test', ip: '127.0.0.1' };

            middleware(req, {}, () => {
                // 검증
                expect(req.body.post.title).to.not.include('<script>');
                expect(req.body.post.metadata.author).to.not.include('DROP');
                expect(req.body.comments[0].text).to.not.include('onerror');
                expect(req.body.comments[1].text).to.equal('Normal comment');
            });
        });

        it('should preserve data types for non-string values', () => {
            const input = {
                id: 123,
                active: true,
                score: 45.67,
                created: new Date(),
                tags: null,
                config: undefined
            };

            const middleware = createSanitizationMiddleware();
            const req = { path: '/test', body: input, method: 'POST', url: '/test', ip: '127.0.0.1' };

            middleware(req, {}, () => {
                expect(req.body.id).to.equal(123);
                expect(req.body.active).to.equal(true);
                expect(req.body.score).to.equal(45.67);
                expect(req.body.created).to.be.instanceof(Date);
                expect(req.body.tags).to.equal(null);
                expect(req.body.config).to.equal(undefined);
            });
        });
    });
});
