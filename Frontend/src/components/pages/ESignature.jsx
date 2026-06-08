import { useMemo, useState } from 'react'
import {
  FiArrowLeft,
  FiCheck,
  FiCheckSquare,
  FiClock,
  FiFileText,
  FiPaperclip,
  FiPlus,
  FiSearch,
  FiSend,
  FiX,
} from 'react-icons/fi'

const SAMPLE_ATTACHMENTS = [
  { name: '견적서.pdf', size: '72.02 KB' },
  { name: '구매 요청 근거.xlsx', size: '18.40 KB' },
]

const SAMPLE_APPROVERS = [
  { id: 'approver-1', name: '최민석 대리', role: '팀장', department: '총무팀', status: '결재', order: 1 },
  { id: 'approver-2', name: '김준수 과장', role: '팀장', department: '경영지원', status: '합의', order: 2 },
  { id: 'approver-3', name: '오세훈 부장', role: '부장', department: '인사팀', status: '전결', order: 3 },
]

const SAMPLE_APPROVALS = [
  {
    id: 'APR-2026-001',
    title: '비품 구매 품의서',
    description: '신규 입사자용 노트북과 주변 장비 구매를 요청합니다.',
    status: 'pending',
    requestedBy: 'me',
    requestedByName: '최민석',
    requestedByRole: '대리',
    requestedAt: '2026-06-08T08:40:00.000Z',
    updatedAt: '2026-06-08T08:40:00.000Z',
    rejectReason: '',
  },
  {
    id: 'APR-2026-002',
    title: '출장비 정산 요청',
    description: '6월 첫째 주 부산 출장비 정산 건입니다.',
    status: 'approved',
    requestedBy: 'user-2',
    requestedByName: '김준수',
    requestedByRole: '과장',
    requestedAt: '2026-06-06T03:20:00.000Z',
    updatedAt: '2026-06-06T07:10:00.000Z',
    rejectReason: '',
  },
  {
    id: 'APR-2026-003',
    title: '근태 이의신청서',
    description: '5월 31일 지각 처리에 대한 이의신청입니다.',
    status: 'rejected',
    requestedBy: 'user-3',
    requestedByName: '박소연',
    requestedByRole: '사원',
    requestedAt: '2026-06-03T05:10:00.000Z',
    updatedAt: '2026-06-03T07:30:00.000Z',
    rejectReason: '증빙 자료가 부족하여 반려되었습니다.',
  },
]

const FORM_TEMPLATE = {
  title: '비품 구매 품의서',
  purpose: '신규 입사자 근무 환경 조성을 위한 업무용 장비 구매',
  department: '총무팀',
  requester: '최민석 대리',
  dueDate: '2026-06-10',
  amount: '1,200,000',
  memo: '입사 예정자 2명 기준으로 노트북 2대, 모니터 2대, 키보드 2세트를 요청합니다.',
}

const FOLDER_LABELS = {
  'esignature-waiting': '결재대기',
  'esignature-completed': '완료',
  'esignature-rejected': '반려',
  'esignature-my': '내가 요청',
}

const FOLDER_ORDER = ['esignature-waiting', 'esignature-completed', 'esignature-rejected', 'esignature-my']

export default function ESignature({ currentSubPage, me, onSubPageChange }) {
  const [approvals, setApprovals] = useState(SAMPLE_APPROVALS)
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [viewMode, setViewMode] = useState('compose')
  const [approverSearch, setApproverSearch] = useState('')
  const [draft, setDraft] = useState(FORM_TEMPLATE)

  const currentFolderLabel = FOLDER_LABELS[currentSubPage] || '결재대기'

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#F4B400'
      case 'approved':
        return '#20A15A'
      case 'rejected':
        return '#E45555'
      default:
        return '#6C757D'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return '대기'
      case 'approved':
        return '승인'
      case 'rejected':
        return '반려'
      default:
        return '진행중'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const filterApprovals = (tab) => {
    return approvals.filter((approval) => {
      if (tab === 'esignature-waiting') return approval.status === 'pending'
      if (tab === 'esignature-completed') return approval.status === 'approved'
      if (tab === 'esignature-rejected') return approval.status === 'rejected'
      if (tab === 'esignature-my') return approval.requestedBy === (me?.id || 'me')
      return true
    })
  }

  const filteredApprovals = useMemo(() => {
    return approvals.filter((approval) => {
      const tab = currentSubPage || 'esignature-waiting'
      if (tab === 'esignature-waiting') return approval.status === 'pending'
      if (tab === 'esignature-completed') return approval.status === 'approved'
      if (tab === 'esignature-rejected') return approval.status === 'rejected'
      if (tab === 'esignature-my') return approval.requestedBy === (me?.id || 'me')
      return true
    })
  }, [approvals, currentSubPage, me?.id])

  const filteredApprovers = useMemo(() => {
    const keyword = approverSearch.trim().toLowerCase()
    if (!keyword) return SAMPLE_APPROVERS

    return SAMPLE_APPROVERS.filter((approver) => {
      return (
        approver.name.toLowerCase().includes(keyword) ||
        approver.role.toLowerCase().includes(keyword) ||
        approver.department.toLowerCase().includes(keyword)
      )
    })
  }, [approverSearch])

  const handleOpenApproval = (approval) => {
    setSelectedApproval(approval)
    setViewMode('detail')
  }

  const handleBackToCompose = () => {
    setSelectedApproval(null)
    setViewMode('compose')
  }

  const handleCreateApproval = () => {
    if (!draft.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    const newApproval = {
      id: `APR-${Date.now()}`,
      title: draft.title,
      description: draft.memo,
      status: 'pending',
      requestedBy: me?.id || 'me',
      requestedByName: me?.name || draft.requester,
      requestedByRole: me?.position || '대리',
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rejectReason: '',
    }

    setApprovals((current) => [newApproval, ...current])
    setSelectedApproval(newApproval)
    setViewMode('detail')
  }

  const handleApprove = (approval) => {
    const updatedApproval = {
      ...approval,
      status: 'approved',
      updatedAt: new Date().toISOString(),
    }

    setApprovals((current) => current.map((item) => (item.id === approval.id ? updatedApproval : item)))
    setSelectedApproval(updatedApproval)
  }

  const handleReject = (approval) => {
    const rejectReason = window.prompt('반려 사유를 입력해주세요.')
    if (!rejectReason) return

    const updatedApproval = {
      ...approval,
      status: 'rejected',
      rejectReason,
      updatedAt: new Date().toISOString(),
    }

    setApprovals((current) => current.map((item) => (item.id === approval.id ? updatedApproval : item)))
    setSelectedApproval(updatedApproval)
  }

  return (
    <div className="esignature-shell">
      <header className="esignature-topbar">
        <div className="esignature-topbar-copy">
          <div className="esignature-eyebrow">전자결재</div>
          <h1>{currentFolderLabel}</h1>
          <p>진행중인 결재문서를 확인하고 상신할 수 있습니다.</p>
        </div>

        <div className="esignature-top-actions">
          <button type="button" className="btn-designated" onClick={() => setViewMode('compose')}>
            <FiFileText />
            결재 작성하기
          </button>
          <button type="button" className="btn-create" onClick={handleCreateApproval}>
            <FiSend />
            기안 상신
          </button>
        </div>
      </header>

      <div className="esignature-workbench">
        <aside className="esignature-rail">
          <div className="esignature-rail-card esignature-rail-card--primary">
            <span className="esignature-rail-title">전자결재</span>
            <p className="esignature-rail-desc">
              결재함을 빠르게 확인하고, 상신 중인 문서를 한 화면에서 처리합니다.
            </p>
            <button type="button" className="btn-create" onClick={() => setViewMode('compose')}>
              <FiPlus />
              결재 작성하기
            </button>
          </div>

          <nav className="esignature-rail-menu" aria-label="전자결재 메뉴">
            {FOLDER_ORDER.map((folderId) => {
              const count = filterApprovals(folderId).length
              const active = currentSubPage === folderId
              return (
                <button
                  key={folderId}
                  type="button"
                  className={`esignature-rail-menu-item ${active ? 'active' : ''}`}
                  onClick={() => onSubPageChange?.(folderId)}
                >
                  <span className="esignature-rail-menu-item-main">
                    <FiCheckSquare />
                    <span>{FOLDER_LABELS[folderId]}</span>
                  </span>
                  <span className="esignature-rail-badge">{count}</span>
                </button>
              )
            })}
          </nav>

          <section className="esignature-approval-feed">
            <div className="esignature-section-head">
              <h2>진행 문서</h2>
              <span>{filteredApprovals.length}건</span>
            </div>

            <div className="esignature-feed-list">
              {filteredApprovals.length === 0 ? (
                <div className="esignature-empty-state">결재 항목이 없습니다.</div>
              ) : (
                filteredApprovals.map((approval) => (
                  <button
                    type="button"
                    key={approval.id}
                    className={`esignature-feed-item ${selectedApproval?.id === approval.id ? 'active' : ''}`}
                    onClick={() => handleOpenApproval(approval)}
                  >
                    <div className="esignature-feed-item-top">
                      <div className="esignature-feed-item-title">
                        <strong>{approval.title}</strong>
                        <span>{approval.id}</span>
                      </div>
                      <span
                        className="esignature-status-chip"
                        style={{ backgroundColor: getStatusColor(approval.status) }}
                      >
                        {getStatusLabel(approval.status)}
                      </span>
                    </div>

                    <div className="esignature-feed-meta">
                      <span>{approval.requestedByName}</span>
                      <span>·</span>
                      <span>{approval.requestedByRole}</span>
                      <span>·</span>
                      <span>{formatDate(approval.requestedAt)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </aside>

        <main className="esignature-main">
          <div className="esignature-main-toolbar">
            <div className="esignature-main-toolbar-copy">
              <h2>결재문서 작성</h2>
              <p>사진 예시처럼 좌우 정보를 나눠서 한 화면에서 작성하도록 구성했습니다.</p>
            </div>

            <div className="esignature-main-toolbar-actions">
              {viewMode === 'detail' && selectedApproval ? (
                <button type="button" className="btn-designated" onClick={handleBackToCompose}>
                  <FiArrowLeft />
                  작성 화면
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-designated"
                  onClick={() => {
                    setSelectedApproval(filteredApprovals[0] || approvals[0] || null)
                    setViewMode('detail')
                  }}
                >
                  <FiClock />
                  상신 현황
                </button>
              )}
              <button type="button" className="btn-create" onClick={handleCreateApproval}>
                <FiSend />
                기안 상신
              </button>
            </div>
          </div>

          <div className="esignature-main-scroll">
            {viewMode === 'detail' && selectedApproval ? (
              <div className="esignature-detail-grid">
                <section className="esignature-stack">
                  <article className="esignature-card">
                    <div className="esignature-detail-header">
                      <div className="esignature-detail-header-top">
                        <h2>{selectedApproval.title}</h2>
                        <span
                          className="esignature-status-chip"
                          style={{ backgroundColor: getStatusColor(selectedApproval.status) }}
                        >
                          {getStatusLabel(selectedApproval.status)}
                        </span>
                      </div>
                      <div className="esignature-detail-meta">
                        <span>신청자: {selectedApproval.requestedByName} {selectedApproval.requestedByRole}</span>
                        <span>·</span>
                        <span>신청일: {formatDate(selectedApproval.requestedAt)}</span>
                        <span>·</span>
                        <span>문서번호: {selectedApproval.id}</span>
                      </div>
                    </div>

                    <div className="esignature-document-preview">
                      <div className="esignature-document-sheet">
                        <div className="esignature-document-sheet-inner">
                          <div className="esignature-document-topline">
                            <strong>기안서</strong>
                            <span>신규 입사자 발생으로 인한 비품 구매 요청</span>
                          </div>

                          <div className="esignature-document-block">
                            <div className="esignature-document-block-header">품의 내용</div>
                            <div className="esignature-document-block-body">
                              {selectedApproval.description || '추가 설명 없음'}
                            </div>
                          </div>

                          {selectedApproval.rejectReason && (
                            <div className="esignature-document-block">
                              <div className="esignature-document-block-header">반려 사유</div>
                              <div className="esignature-document-block-body">
                                {selectedApproval.rejectReason}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="esignature-actions">
                        <button type="button" className="btn-designated" onClick={handleBackToCompose}>
                          <FiArrowLeft />
                          돌아가기
                        </button>
                        {selectedApproval.status === 'pending' && (
                          <>
                            <button type="button" className="btn-create" onClick={() => handleApprove(selectedApproval)}>
                              <FiCheck />
                              승인
                            </button>
                            <button type="button" className="btn-designated" onClick={() => handleReject(selectedApproval)}>
                              <FiX />
                              반려
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>

                  <article className="esignature-card">
                    <div className="esignature-card-title">
                      <h3>결재 진행 내역</h3>
                      <span>최신 상태 기준</span>
                    </div>
                    <div className="esignature-timeline">
                      <div className="esignature-timeline-item">
                        <div className="esignature-timeline-dot" />
                        <div>
                          <h4>기안 작성</h4>
                          <p>{formatDate(selectedApproval.requestedAt)}에 결재 문서가 상신되었습니다.</p>
                        </div>
                      </div>
                      <div className="esignature-timeline-item">
                        <div className="esignature-timeline-dot" />
                        <div>
                          <h4>현재 상태</h4>
                          <p>
                            {selectedApproval.status === 'pending'
                              ? '결재 대기 중입니다.'
                              : selectedApproval.status === 'approved'
                                ? '결재가 승인되었습니다.'
                                : '결재가 반려되었습니다.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </section>

                <section className="esignature-stack">
                  <article className="esignature-card">
                    <div className="esignature-card-title">
                      <h3>기안 정보</h3>
                      <span>결재 문서 메타데이터</span>
                    </div>

                    <div className="esignature-form-grid">
                      <div className="esignature-form-group">
                        <label>제목</label>
                        <input value={selectedApproval.title} readOnly />
                      </div>
                      <div className="esignature-form-group">
                        <label>상태</label>
                        <input value={getStatusLabel(selectedApproval.status)} readOnly />
                      </div>
                      <div className="esignature-form-group">
                        <label>작성자</label>
                        <input value={`${selectedApproval.requestedByName} ${selectedApproval.requestedByRole}`} readOnly />
                      </div>
                      <div className="esignature-form-group">
                        <label>문서번호</label>
                        <input value={selectedApproval.id} readOnly />
                      </div>
                    </div>
                  </article>

                  <article className="esignature-card">
                    <div className="esignature-card-title">
                      <h3>첨부파일</h3>
                      <span>{SAMPLE_ATTACHMENTS.length}개</span>
                    </div>

                    <div className="esignature-attachment-list">
                      {SAMPLE_ATTACHMENTS.map((attachment) => (
                        <div key={attachment.name} className="esignature-attachment-item">
                          <span>
                            <FiPaperclip style={{ marginRight: 8 }} />
                            {attachment.name}
                          </span>
                          <span>{attachment.size}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                </section>
              </div>
            ) : (
              <div className="esignature-layout">
                <section className="esignature-stack">
                  <article className="esignature-card">
                    <div className="esignature-card-title">
                      <h3>품의서</h3>
                      <span>기안 문서</span>
                    </div>

                    <div className="esignature-form-grid">
                      <div className="esignature-form-group full">
                        <label>제목</label>
                        <input
                          value={draft.title}
                          onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))}
                          placeholder="결재 제목을 입력하세요"
                        />
                      </div>

                      <div className="esignature-form-group">
                        <label>기안 부서</label>
                        <input
                          value={draft.department}
                          onChange={(e) => setDraft((current) => ({ ...current, department: e.target.value }))}
                        />
                      </div>

                      <div className="esignature-form-group">
                        <label>작성자</label>
                        <input
                          value={draft.requester}
                          onChange={(e) => setDraft((current) => ({ ...current, requester: e.target.value }))}
                        />
                      </div>

                      <div className="esignature-form-group">
                        <label>기안일</label>
                        <input
                          type="date"
                          value={draft.dueDate}
                          onChange={(e) => setDraft((current) => ({ ...current, dueDate: e.target.value }))}
                        />
                      </div>

                      <div className="esignature-form-group">
                        <label>예산</label>
                        <input
                          value={draft.amount}
                          onChange={(e) => setDraft((current) => ({ ...current, amount: e.target.value }))}
                        />
                      </div>

                      <div className="esignature-form-group full">
                        <label>기안 사유</label>
                        <textarea
                          value={draft.purpose}
                          onChange={(e) => setDraft((current) => ({ ...current, purpose: e.target.value }))}
                          placeholder="결재가 필요한 이유를 입력하세요"
                        />
                      </div>

                      <div className="esignature-form-group full">
                        <label>상세 내용</label>
                        <textarea
                          value={draft.memo}
                          onChange={(e) => setDraft((current) => ({ ...current, memo: e.target.value }))}
                          placeholder="상세 내용을 입력하세요"
                        />
                      </div>
                    </div>
                  </article>

                  <article className="esignature-card">
                    <div className="esignature-card-title">
                      <h3>문서 미리보기</h3>
                      <span>예시 양식</span>
                    </div>

                    <div className="esignature-document-preview">
                      <div className="esignature-document-sheet">
                        <div className="esignature-document-sheet-inner">
                          <div className="esignature-document-topline">
                            <strong>{draft.title || '결재 제목'}</strong>
                            <span>{draft.department} / {draft.requester}</span>
                          </div>

                          <div className="esignature-document-block">
                            <div className="esignature-document-block-header">기안 목적</div>
                            <div className="esignature-document-block-body">
                              {draft.purpose || '기안 목적을 입력하면 여기에 표시됩니다.'}
                            </div>
                          </div>

                          <div className="esignature-document-block">
                            <div className="esignature-document-block-header">상세 내용</div>
                            <div className="esignature-document-block-body">
                              {draft.memo}
                            </div>
                          </div>

                          <div className="esignature-document-block">
                            <div className="esignature-document-block-header">예산 및 일정</div>
                            <div className="esignature-document-block-body">
                              <table className="esignature-document-table">
                                <tbody>
                                  <tr>
                                    <th>예산</th>
                                    <td>{draft.amount}</td>
                                  </tr>
                                  <tr>
                                    <th>기안일</th>
                                    <td>{draft.dueDate}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="esignature-actions">
                        <button type="button" className="btn-designated" onClick={() => setViewMode('detail')}>
                          <FiClock />
                          상신 현황 보기
                        </button>
                        <button type="button" className="btn-create" onClick={handleCreateApproval}>
                          <FiSend />
                          기안 상신
                        </button>
                      </div>
                    </div>
                  </article>
                </section>

                <section className="esignature-panel">
                  <article className="esignature-panel-card">
                    <h3>기안정보 등록</h3>
                    <p className="esignature-panel-subtitle">결재 문서의 기본 정보를 입력합니다.</p>

                    <div className="esignature-form-grid">
                      <div className="esignature-form-group full">
                        <label>문서 제목</label>
                        <input value={draft.title} onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))} />
                      </div>
                      <div className="esignature-form-group">
                        <label>결재 부서</label>
                        <input value={draft.department} onChange={(e) => setDraft((current) => ({ ...current, department: e.target.value }))} />
                      </div>
                      <div className="esignature-form-group">
                        <label>작성자</label>
                        <input value={draft.requester} onChange={(e) => setDraft((current) => ({ ...current, requester: e.target.value }))} />
                      </div>
                    </div>
                  </article>

                  <article className="esignature-panel-card">
                    <h3>결재자지정</h3>
                    <p className="esignature-panel-subtitle">예시 이미지처럼 결재자 흐름을 오른쪽에 배치했습니다.</p>

                    <div className="esignature-approver-search">
                      <input
                        type="text"
                        placeholder="결재자를 검색하세요"
                        value={approverSearch}
                        onChange={(e) => setApproverSearch(e.target.value)}
                      />
                      <button type="button">
                        <FiSearch />
                      </button>
                    </div>

                    <div className="esignature-approver-list">
                      {filteredApprovers.map((approver) => (
                        <div key={approver.id} className="esignature-approver-item">
                          <div className="esignature-approver-info">
                            <strong>
                              {approver.order}. {approver.name}
                            </strong>
                            <span>
                              {approver.department} · {approver.role}
                            </span>
                          </div>
                          <span className="esignature-status-chip" style={{ backgroundColor: approver.status === '결재' ? '#20A15A' : '#1f7be6' }}>
                            {approver.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="esignature-panel-card">
                    <h3>첨부파일</h3>
                    <p className="esignature-panel-subtitle">견적서, 요청서 등 관련 파일을 확인합니다.</p>

                    <div className="esignature-attachment-list">
                      {SAMPLE_ATTACHMENTS.map((attachment) => (
                        <div key={attachment.name} className="esignature-attachment-item">
                          <span>
                            <FiPaperclip style={{ marginRight: 8 }} />
                            {attachment.name}
                          </span>
                          <span>{attachment.size}</span>
                        </div>
                      ))}
                    </div>
                  </article>

                  <button type="button" className="esignature-panel-action" onClick={handleCreateApproval}>
                    기안 저장
                  </button>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
